 /******************************************************
 * PLEASE DO NOT EDIT THIS FILE
 * the verification process may break
 * ***************************************************/

'use strict';

var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var cors = require("cors");
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;

var dbURL = ""

app.use(bodyParser.json());
app.use(cors());
app.set('json spaces', 2);

if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
  
app.route('/')
    .get(function(req, res) {
		  res.sendFile(process.cwd() + '/views/index.html');
    });

app.route("/new/:urlToShorten(*)")
  .get(function(req, res) {
  
  
  var output = {};
  var dbLink = "mongodb://admin_eirin:$h0rtur|@ds01316.mlab.com:1316/shorturl";
  
  MongoClient.connect(dbLink, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      console.log('Connection established to', url);

      // do some work here with the database.
      var shortenedURL = "";
      var url = req.params.urlToShorten;

      // Checks to see if it is an actual url
      // Regex from https://gist.github.com/dperini/729294
      var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;


      if (regex.test(url)) {
        var short = Math.floor(Math.random() * 100000).toString();
        shortenedURL = short;

    //     var data = new shortURL({
    //       originalURL : url,
    //       shortURL : shortenedURL
    //     });

    //     data.save(function(err) {
    //       if (err) return res.send("Error saving your data.");
    //     });

    //     output = data;

      } else {
        // shortURL = "Invalid URL";
        // output = {
      //   originalURL : url,
      //   shortURL : shortURL
      // }
    }

      //Close connection
      db.close();
    }
  });

  res.json(output);
  
});

// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

