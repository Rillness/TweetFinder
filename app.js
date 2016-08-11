var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var colors = require('colors');
var bodyParser = require('body-parser');
var Twitter = require('twitter');
var request = require('request');
var Twit = require('twit');
var mongoose = require('mongoose');
var events = require('events').EventEmitter.prototype._maxListeners = 0;

//Shows if the connections are saved, or not saved, and it gets appended into this array below.
var connections = [];

//Enter the Twitter credentials that you have gained.
var T = new Twit({
  consumer_key: "ENTER TWITTER CONSUMER KEY",
  consumer_secret: "ENTER CONSUMER SECRET",
  access_token: "ENTER ACESS TOKEN",
  access_token_secret: "ENTER ACESS TOKEN SECRET"
});

// Creates a sample stream to start the project.
var newStream = T.stream('statuses/filter', { track : "mango"});

//Connect into socket.io
io.sockets.on('connection', function(socket){
  connections.push(socket);
  console.log('Connected', connections.length + ' sockets online.');

  //Disconnect
  socket.on('disconnect', function(data){
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected', connections.length + ' sockets left.');
  });

});

//Set view engine to ejs (personal favorite)
app.set('view engine', 'ejs');

//Use body-parser
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req,res){
  newStream.stop()
  res.render('index');
});

app.post('/tweetie', function(req,res){

res.redirect('/tweetie/' + req.body.tweetSearch);

});

app.get('/tweetie/restart', function(req,res){
  T.stream.stop();
  res.redirect('/index');
});


app.get('/tweetie/:searched', function(req,res){
  var searchQuery = req.params.searched;

//Create a new stream that takes in what you have searched.
  newStream = T.stream('statuses/filter', { track: req.params.searched });
    newStream.on('tweet', function(socket){

     io.sockets.emit('tweets', { usersIn : socket.user.screen_name, twit : socket.text });

  });
  //Render the ejs file, with a couple of variables.
  res.render('tweets', {
    searchQuery : searchQuery,
    tweets : 'test'
    });

});



server.listen("3000", function(){
  console.log('------------------------'.red);
  console.log(' Listening on PORT 3000'.green);
  console.log('------------------------'.red);

});
