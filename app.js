var express = require ('express');
var app = express();

app.get('/', function(req, res) {
	res.send('Hello world!');
});

app.get('/bye', function(req, res) {
	res.send('Bye!');
});

app.get('*', function(req, res) {
	res.send('Page not found...')
});

app.listen(3000, process.env.IP, function() {
	console.log("Server started");
});
