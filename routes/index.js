var ejs = require("ejs");
var url = require('url');

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.allPortCalls = function(req, res){
	
};