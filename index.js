//dependencies
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const jsondb = require('node-json-db/dist/JsonDB');
const Nylas = require('nylas');
const sessionStorage = require('sessionstorage');

//initialization
const app = express();
const port = 1200;

//ejs setup
app.set('view engine', 'ejs');

//bodyParser setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

//db setup
var users = new jsondb("UsersData", true, true, '/');

//nylas setup
Nylas.config({
    appId: '9lkzcjkmcbkbmndwi0wd9tnhe',
    appSecret: '2dq26yihbncaj9wg5b2bws92n',
});


//root URL GET
app.get('/', function(req, res) {
    try {
        let settings = users.getData('/' + sessionStorage.getItem('username'));
        res.render('userSettings.ejs', {settings, port});
    } catch (err) {
        console.log("not signed in or user does not exist");
        res.render('main.ejs', {port});
    }
});

//signUp URL GET
app.get('/signUp', function(req, res) {
    res.render('signUp.ejs', {port});
});

//signUp URL POST
app.post('/signUp', function(req, res) {
    meetingInfo = {meetingTitle: "Sales Meeting", meetingLink: req.body.username, timezone: -7, 
                        days: [false, true, true, true, true, true, false], timeIn: 9, timeOut: 17, meetingLength: 30};
    nylasInfo = {auth: false, ACCESS_TOKEN: null};
    response = {firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, 
                    username: req.body.username, password: req.body.password, meetingInfo, nylasInfo};
    
    try {
        users.getData('/' + response.username);
        console.log("username already exists");
        res.redirect('http:localhost:' + port + '/signIn');
    } catch (err) {
        users.push('/' + response.username, response);
        console.log("user created");
        sessionStorage.setItem("username", response.username);
        res.redirect('http://localhost:' + port + '/');
    }
});

//signIn URL GET
app.get('/signIn', function(req, res) {
    res.render('signIn.ejs', {port});
});

//signIn URL POST
app.post('/signIn', function(req, res) {
    response = {username: req.body.username, password: req.body.password};
    let credentials;

    try {
        credentials = users.getData('/' + response.username);

        if (response.password == credentials.password) {
            console.log (response.username + " signed in");
            sessionStorage.setItem('username', response.username);
            res.redirect('http://localhost:' + port + '/');
        } else {
            console.log ("incorrect password");
            res.redirect('http://localhost:' + port + '/signIn');
        }
    } catch (err) {
        console.log('user does not exist')
        res.redirect('http://localhost:' + port + '/signIn');
    }
});

//signOut
app.get('/signOut', function(req, res) {
    sessionStorage.clear();
    res.redirect('http://localhost:' + port);
})

//nylas oauth
//connect to nylas oauth
app.get('/connect', (req, res, next) => {
    options = {
        redirectURI: `http://localhost:${port}/oauth/callback`
    };
    res.redirect(Nylas.urlForAuthentication(options));
});

//handle response
app.get('/oauth/callback', (req, res, next) => {
    if (req.query.code) {
        res.render('connecting.ejs', {port});
        Nylas.exchangeCodeForToken(req.query.code).then(token => {
            console.log(token);
            users.push('/' + sessionStorage.getItem('username') +'/nylasInfo/ACCESS_TOKEN', token);
            users.push('/' + sessionStorage.getItem('username') +'/nylasInfo/auth', true);
        })
    } else if (req.query.error) {
        res.render('oauthError.ejs', {error:req.query.reason, port});
    }
});

//nylas test
app.get('/nylas', function (req, res) {
    const nylas = Nylas.with(users.getData('/' + sessionStorage.getItem('username') + '/nylasInfo/ACCESS_TOKEN'))
    nylas.calendars.list().then(calendars => {
        res.send(calendars);
        console.log(calendars);
    })

    nylas.calendars.first({ read_only: false }).then(calendar => {
        console.log(calendar);
    });
})

//running confirmation message
app.listen(port, () => console.log(`Local host opened at port ${port}!`));