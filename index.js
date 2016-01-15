'use strict'

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('superagent');
var path = require('path');
var moment = require('moment');

var suli = {
	id: 1,
	name: "suli",
	style: "primary"
};
var bead = {
	id: 2,
	name: "beadandó",
	style: "warning"
}

var alma = {
	id: 1,
	title: "Beadandót csinálni",
	deadline: '2016.01.20.',
	labels: [suli, bead],
	done: true
};
var korte = {
	id: 2,
	title: 'CodeCheckert csinálni',
	deadline: '2016.01.15.',
	labels: [suli],
	done: false
};

var todos = [alma, korte];
var labels = [suli, bead];

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

function getLabelById(id) {
	return labels.filter(function(item) {
		return item.id == id;
	})[0];
};

function getLabelByName(name) {
	return labels.filter(function(item) {
		return item.name == name;
	})[0];
};

app.use(bodyParser.urlencoded({
	extended: true
})); 

app.get('/', function(req, res) {
	res.status(200).sendFile(path.join(__dirname, './public', 'index.html'));
});

app.get('/todos', function(req, res) {
	res.status(200).send({todos: todos.sort(sortTodos)});
});

app.get('/labels', function(req, res) {
	res.status(200).send({labels: labels});
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
	if(getLabelByName(req.body.name) == undefined && req.body.name != '') {
		var new_label = {
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

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('ToDo app listening at http://%s:%s', host, port);
});