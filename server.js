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

var dbLink = "mongodb://admin_eirin:$h0rtur|@ds149763.mlab.com:49763/shorturl";

MongoClient.connect(dbLink, function(err, db) {
  
  db.createCollection("sites", {
    capped: true,
    size: 5242880,
    max: 5000
  });
  
});



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

app.get("/:codeString", function(req, res) {
  
  var requestURL = req.params.codeString;
  
  MongoClient.connect(dbLink, function(err, db) {
    if (err) {
      console.log("Error trying to load data");
    }
    
    var sites = db.collection("sites");
    
    sites.findOne({
      shortURL : "https://actually-note.glitch.me/" + requestURL
    }, function(err, data) {
      if (err) {
        console.log("Error trying to find data");
        throw err;
      }
      
      if (data) {
        res.redirect(data.originalURL);
      } else {
          res.send("Hi! I'm sorry this URL is not stored in our database.");
      }
    });
    
  });
  
  
});


function isURLValid(url) {
  
  // Regex from https://gist.github.com/dperini/729294
  var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
  
  if (regex.test(url)) {
    return true;
  }
  
  return false;
}

function getRandomNumber() {
  return Math.floor(Math.random() * 100000).toString();
}

app.get("/new/:urlToShorten(*)", function(req, res) {
  
  var output = {};
  
  MongoClient.connect(dbLink, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    }

    var shortenedURL = "";
    var url = req.params.urlToShorten;

    if (isURLValid(url)) {
      shortenedURL = "https://actually-note.glitch.me/" + getRandomNumber();
      
      output = {
        originalURL : url,
        shortURL : shortenedURL
      };

      var sites = db.collection("sites");
      
      sites.save(output, function(err, result) {
        if (err) {
          console.log("Error trying to save your data.");
        }
      });

    } else {
      shortenedURL = "Invalid URL";
      output = {
        originalURL : url,
        shortURL : shortenedURL
      };
    }  

    res.json(output);
    //Close connection
    db.close();
    
  });
  
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

