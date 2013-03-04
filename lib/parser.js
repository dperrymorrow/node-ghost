
var fs = require('fs'),
	_ = require('underscore')._,
	_s = require('underscore.string'),
	marked = require('marked');

var Parser = function () {

	this.parseFile = function (filePath, callback) {
		this.filePath = filePath;

		fs.readFile(this.filePath, "utf8", _.bind(function (err, data) {
			data = err ? {error: err} : this.toObject(data);
			callback(data);
		}, this));
	};

	this.getTitle = function () {
		var fileName = _.last(this.filePath.split("/"));
		return _s.titleize(_s.humanize(_.first(fileName.split("."))));
	};

	this.toObject = function (string) {
		var keys = string.split(/\r?\n\s*-\s*\r?\n/),
			returnObj = {};

		// if there was no dilem like just content var
		keys = keys || [string];

		_.each(keys, function (key) {
			var varName = _.first(key.split(":")),
				value = key.replace(varName + ":", "");

			// only clean it if not content as can effect markdown parsing
			returnObj[_s.camelize(varName)] = (varName === 'content') ? _s.trim(value) : _s.clean(value);
		});

		// dont pass in undefined to markdown
		returnObj.content  = returnObj.content ? marked(returnObj.content) : "";
		// default the title if one not present
		returnObj.title    = _.isUndefined(returnObj.title) ? this.getTitle() : returnObj.title;
		// default the template if one not present
		returnObj.template = returnObj.template ? returnObj.template.replace(".html", "") + ".html" : "default.html";
		return returnObj;
	};

	return this;
};

module.exports = Parser;
