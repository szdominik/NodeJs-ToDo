'use strict'

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('superagent');
var path = require('path');
var moment = require('moment');

var owners = [
	{
		id: 1,
		name: "dominik"
	},
	{
		id: 2,
		name: "admin"
	}
]

var labels = [
	{
		ownerId: 2,
		id: 1,
		name: "egyéb",
		style: "info"
	},
	{
		ownerId: 1,
		id: 2,
		name: "suli",
		style: "primary"
	},
	{
		ownerId: 1,
		id: 3,
		name: "beadandó",
		style: "warning"
	}
]

var todos = [
	{
		ownerId: 1,
		id: 1,
		title: 'Beadandót csinálni',
		deadline: '2016.01.20.',
		labels: [2, 3],
		done: true
	},
	{
		ownerId: 1,
		id: 2,
		title: 'CodeCheckert csinálni',
		deadline: '2016.01.15.',
		labels: [2],
		done: false
	},
	{
		ownerId: 2,
		id: 3,
		title: 'főzni',
		deadline: '2016.02.10. 12:00',
		labels: [1],
		done: false
	}
]

function sortTodos(a, b) {
	if(a.deadline > b.deadline)
		return 1;
	else if(a.deadline < b.deadline)
		return -1;
	return 0;
};

function getToDo(id) {
	return todos.filter(function(item) {
		return item.id == id;
	})[0];
};

function getOwnerByName(name) {
	return owners.filter(function(item) {
		return item.name == name;
	})[0];
};

function getLabelById(id) {
	return labels.filter(function(item) {
		return item.id == id;
	})[0];
};

function getLabelByName(name, id) {
	return labels.filter(function(item) {
		return item.ownerId == id && item.name == name;
	})[0];
};

function hasLabel(item, id) {
	var volt = false;
	item.labels.forEach(function(label) {
		if(label == id)
			volt = true;
	});
	return volt;
}

app.use(bodyParser.urlencoded({
	extended: true
})); 

app.get('/', function(req, res) {
	res.status(200).sendFile(path.join(__dirname, './public', 'index.html'));
});

app.get('/todos', function(req, res) {
	var filtered = todos.sort(sortTodos);
	if(req.query.labelId != undefined && req.query.labelId != 0)
		filtered = filtered.filter(function(item) {
			return hasLabel(item, parseInt(req.query.labelId, 10));
		});
	if(req.query.ownerId != undefined) {
		filtered = filtered.filter(function(item) {
			return item.ownerId == parseInt(req.query.ownerId, 10);
		});
		res.status(200).send({todos: filtered});
	}
	else
		res.redirect('/');
});

app.get('/labels', function(req, res) {
	if(req.query.ownerId != undefined) {
		var filtered = labels.filter(function(item) {
			return item.ownerId == parseInt(req.query.ownerId, 10);
		});
		res.status(200).send({labels: filtered});
	}
	else
		res.redirect('/');
});

app.get('/users', function(req, res) {
	var filtered = owners.filter(function(item) {
		return item.name == req.query.name;
	});
	if(filtered.length != 0)
		res.status(200).send({ownerId: filtered[0].id});
	else
		res.status(404).send({name: req.query.name});
});

app.post('/users', function(req, res) {
	if(req.body.name != '' && getOwnerByName(req.body.name) == undefined) {
		var new_owner = {
			id: owners.length + 1,
			name: req.body.name
		};
		owners.push(new_owner);
		res.status(200).send({ownerId: new_owner.id});
	}
	else {
		res.status(404).send({name: req.body.name});
	}
});

app.post('/todos', function(req, res) {
	if(req.body.title != '') {
		var labelsToNewTodo = [];
		Object.keys(req.body).map(function(value, index) {
			if(req.body[value] == 'on')
				labelsToNewTodo.push(getLabelById(parseInt(value.slice(5), 10)));
		});
		var deadline = (req.body.deadline != '') ? req.body.deadline : moment(new Date()).add(14, 'days').format('YYYY.MM.DD.');
		
		var new_todo = {
			ownerId: req.body.ownerId,
			id: todos.length + 1,
			title: req.body.title,
			deadline: deadline,
			labels: labelsToNewTodo,
			done: false
		};
		todos.push(new_todo);
	}
	res.redirect('/');
});

app.post('/labels', function(req, res) {
	if(getLabelByName(req.body.name, req.body.ownerId) == undefined && req.body.name != '') {
		var new_label = {
			ownerId: req.body.ownerId,
			id: labels.length + 1,
			name: req.body.name,
			style: req.body.style
		};
		labels.push(new_label);
	}
	res.redirect('/');
});

app.post('/donetodo', function(req, res) {
	var id = parseInt(req.body.id, 10);
	todos = todos.map(function(item){
		if(item.id == id)
			item.done = true;
		return item;
	});
	res.status(201).send({ new_todo: getToDo(id) });
});

var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('ToDo app listening at http://%s:%s', host, port);
});