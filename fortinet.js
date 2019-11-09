var express = require('express');
var session = require('express-session');
var bodyParser = require("body-parser");
var exphbs = require('express-handlebars');
var __global = require('./js/globals');
var routes = require("./js/routes.js");

// router.
var app = express();

// root directory of website.
app.use(express.static(__dirname));
//app.use(express.static(__dirname , 'meshlabjs'));
__global.rootDir = __dirname + '/';
console.log('root:' + __global.rootDir);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
    secret: 'p_session_secret',
    httpOnly: true,
    name: 'p_cokie_name',
    proxy: true,
    resave: false,
    saveUninitialized: true
  }));

  
  app.set('view engine', 'ejs');

  
routes(app);

app.listen(8080, function () {
  console.log('Express server listening on port 8080');
});
