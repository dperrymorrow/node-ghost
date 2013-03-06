
var fs = require('fs'),
	_ = require('underscore')._,
	_s = require('underscore.string'),
	marked = require('marked'),
	async = require("async");

var Parser = function () {

	Parser.prototype.filePath  = '';
	Parser.prototype.parsedObj = {};
	Parser.prototype.callback  = function(){};

	Parser.prototype.parseFile = function (filePath, callback) {
		this.filePath = filePath;
		this.callback = callback;

		// _.bindAll(this);

		fs.readFile(this.filePath, "utf8", _.bind(function (err, data) {
			data = err ? {error: err} : this.toObject(data);
			callback(data);
		}, this));
	};

	Parser.prototype.getTitle = function () {
		var fileName = _.last(this.filePath.split("/"));
		return _s.titleize(_s.humanize(_.first(fileName.split("."))));
	};

	Parser.prototype.toObject = function (string) {
		var keys = string.split(/\r?\n\s*-\s*\r?\n/) || [string];
		this.parsedObj = {};

		_.each(keys, function (key) {
			var matches = /^(?:(.+):)?((?:.|\s)*)$/.exec(key);
			if (matches) {
				var varName = matches[1];
				var value = matches[2];
				// only clean it if not content as can effect markdown parsing
				this.parsedObj[_s.camelize(varName)] = (varName === 'content') ? _s.trim(value) : _s.clean(value);
			}
		}, this);

		// dont pass in undefined to markdown
		this.parsedObj.content  = this.parsedObj.content ? marked(this.parsedObj.content) : "";
		// default the title if one not present
		this.parsedObj.title    = _s.isBlank(this.parsedObj.title) ? this.getTitle() : this.parsedObj.title;
		// default the template if one not present
		this.parsedObj.urlSlug  = _s.slugify(this.parsedObj.title);
		this.parsedObj.template = this.parsedObj.template ? this.parsedObj.template.replace(".html", "") + ".html" : "default.html";

		return this.parsedObj;
	};

	return this;
};

module.exports = Parser;
