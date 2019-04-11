//dependencies
const express = require('express');
var ejs = require('ejs');
var bodyParser = require('body-parser');

//initialization
const app = express();
const port = 1200;

//ejs setup
app.set('view engine', 'ejs');

//bodyParser setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

//root URL GET
app.get('/', function(req, res) {
    res.render('main.ejs', {port:port});
});

//userCreate URL GET (sign up)
app.get('/userCreate', function(req, res) {
    res.render('userCreate.ejs', {port:port});
});

//userCreate/new URL POST
app.post('/userCreate/new', function(req, res) {
    response = {
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        username : req.body.username,
        password : req.body.password
        
    };

    res.redirect('http://localhost:' + port + '/user/' + req.body.username);
    console.log(response)
});

//user URL GET (sign in)
app.get('/user', function(req, res) {
    res.render('userValidate.ejs', {port:port});
});

//user/validate URL POST
app.post('/user/validate', function(req, res) {
    res.redirect('http://localhost:' + port + '/user/' + req.body.username);
});

//user/id URL GET (settings)
app.get('/user/:id', function(req, res) {
    res.render('userSettings.ejs', {username:req.params.id, port:port});
});

//running confirmation message
app.listen(port, () => console.log(`Local host opened at port ${port}!`));