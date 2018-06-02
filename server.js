var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');


var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todonextID = 1;
app.use(bodyParser.json());


app.get('/', function (req, res) {
      res.send('TODO api Root');
});

//getting all todos
app.get('/todos', function (req, res) {
      var queryParams = req.query;
      var filteredTodos = todos;
      if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
            filteredTodos = _.where(filteredTodos, { "completed": true });

      } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
            filteredTodos = _.where(filteredTodos, { "completed": false })
      }
      if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {

            filteredTodos = _.filter(filteredTodos, function (todo) {
                  return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
            });
      }

      res.json(filteredTodos);  //shortcut to convert to json object                    
});
// get todo by id
app.get('/todos/:id', function (req, res) {
      var todoid = parseInt(req.params.id, 10);
      var matchedTodo = _.findWhere(todos, { id: todoid });
      /*  var matchedTodo;
      //iterate over the array to find the match
todos.forEach(function(todo){
      if(todoid === todo.id){
                  matchedTodo =todo;
      }

});
*/


      if (matchedTodo) {
            res.json(matchedTodo);
      }
      else {
            res.status(400).send();
      }




});
//POST
app.post('/todos', function (req, res) {
      var body = _.pick(req.body, 'description', 'completed');

     db.todo.create(body).then(function(todo){
             res.json(todo.toJSON());

     }).catch(function(e){
            res.status(400).json(e); 
     });
     
      /* //use _.pick to select only description and completed

      if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
            //if body.completed is not bolean and description is not empty string
            return res.status(400).send();

      }

      body.description = body.description.trim();
      body.id = todonextID++;
      todos.push(body);


      console.log('description' + ' ' + body.description);
      res.json(body); */

});

//delete/todos/:id
app.delete('/todos/:id', function (req, res) {
      var todoid = parseInt(req.params.id, 10);
      var matchedTodo = _.findWhere(todos, { id: todoid });
      if (!matchedTodo) {
            res.status(404).json({ "error": "no todo item found with that id" })
      }
      else {
            todos = _.without(todos, matchedTodo);
            res.json(matchedTodo);

      }

});
//Put/todos/:id
app.put('/todos/:id', function (req, res) {
      var todoid = parseInt(req.params.id, 10);
      var matchedTodo = _.findWhere(todos, { id: todoid });
      var body = _.pick(req.body, 'description', 'completed');

      var validAttributes = {};
      if (!matchedTodo) {
            return res.status(404).json({ "error": "id for the specifed todo not found.Nothing to do !!!" })
      }
      if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
            validAttributes.completed = body.completed;

      } else if (body.hasOwnProperty('completed')) {
            return res.status(400).send();

      }
      if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
            validAttributes.description = body.description;

      } else if (body.hasOwnProperty('description')) {
            return res.status(400).send();

      }

      _.extend(matchedTodo, validAttributes);
      res.json(matchedTodo);

});

db.sequelize.sync().then(function () {
      app.listen(PORT, function () {
            console.log('server started on port:' + PORT + '!');

      });
});


