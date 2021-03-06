var net = require('net');
var uuid = require('uuid');
var mongodb = require('mongodb');
var moment = require('moment');

var MongoClient = require('mongodb').MongoClient;
var objDB = null;

var tcpPort = 5000;
var chunk = "";

var mongoDbUrl = 'mongodb://user:pwd1234@ds030827.mongolab.com:30827/LogMongoDB';
//var mongoDbUrl = 'mongodb://127.0.0.1:27017/logdb';

MongoClient.connect(mongoDbUrl, function(err, db) {
	if (err) throw err;
	console.log("Connected to Database: " + mongoDbUrl);
	objDB = db;
});

net.createServer(function(socket) {
    console.log('CONNECTED: ' + socket.remoteAddress +':'+ socket.remotePort);
    socket.setEncoding("utf8");
	
	socket.on('data', function(data) {
		chunk += data.toString();
		index = chunk.indexOf('\n'); 

		while (index > -1) {         
			s = chunk.substring(0, index); // Create string up until the delimiter
			if(s != "null"){
				writeLog(s);  
			}
			chunk = chunk.substring(index + 1); // Cuts off the processed chunk
			index = chunk.indexOf('\n'); // Find the new delimiter
		}      
    });
  
    socket.on('close', function(data) {
        console.log('Connection Closed');
    });
}).listen(tcpPort);


function writeLog(s) {
	try{
		var document = JSON.parse(s);
		var ts = new Date().getTime();
        var i = ts % 1000;
        //var t = new mongodb.BSONPure.Timestamp(i, Math.floor(ts * 0.001));
		var t = moment().format("YYYY-MM-DD hh:mm:ss.SSS");
		document.createTimeStamp = t;		
		console.log(document.createTimeStamp);
		if(objDB != null){
			objDB.collection('log').insert(document, function(err, records) {
				if (err){
					console.log("insert data failed, error=" + error);
				}
			});
		}
	}
	catch(e){
		console.log("EXCEPTION=" + e);
	}
}

console.log('Server listening on port:'+ tcpPort);