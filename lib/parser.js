
var fs = require('fs'),
	_ = require('underscore')._,
	_s = require('underscore.string');

var Parser = function () {

	this.parseFile = function (filePath, callback){
		this.filePath = filePath;

		fs.readFile(this.filePath, "utf8", _.bind(function (err, data) {
			var data = err ? {error: err} : this.toObject(data);
			callback(data);
		}, this));
	}

	this.getTitle = function () {
		var fileName = _.last(this.filePath.split("/"));
		return _s.humanize(_.first(fileName.split(".")));
	}

	this.toObject = function (string) {
		// make sure there are no likebreaks around the dilem
		string = _s.lines(string).map(function(line) {return _s.trim(line); }).join("\n");

		var keys = string.split("\n-\n"),
			returnObj = {};

		_.each(keys, function (key) {
			var varName        = _.first(key.split(":"));
			returnObj[varName] = _s.trim(key.replace(varName + ":", ""));
		});

		returnObj.title    = _.isUndefined(returnObj.title) ? this.getTitle(this.filePath) : returnObj.title;
		returnObj.template = returnObj.template ? returnObj.template.replace(".html", "") + ".html" : "default.html";
		return returnObj;
	}

	return this;
}

module.exports = Parser;