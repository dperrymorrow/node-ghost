
var fs = require('fs'),
	_ = require('underscore')._,
	_s = require('underscore.string');

var parser = {
	parseFile: function (filePath, callback) {
		fs.readFile(filePath, "utf8", _.bind(function (err, data) {
			if (err) {
				// returns with an error key
				callback({error: err});
			} else {
				// converts the text content to object
				callback(this.toObject(data, filePath));
			}
		}, this));
	},

	getTitle: function (filePath) {
		var fileName = _.last(filePath.split("/"));
		return _s.humanize(_.first(fileName.split(".")));
	},

	toObject: function (string, filePath) {
		// make sure there are no likebreaks around the dilem
		string = string.replace(" \n", "\n").replace("\n ", "\n");

		var keys = string.split("\n-\n"),
			returnObj = {};

		_.each(keys, function (key) {
			var varName        = _.first(key.split(":"));
			returnObj[varName] = _s.trim(key.replace(varName + ":", ""));
		});

		returnObj.title = returnObj.title || this.getTitle(filePath);
		returnObj.template = returnObj.template || "default";
		returnObj.template = returnObj.template.replace(".html", "") + ".html";

		return returnObj;
	}
}

exports.parser = parser;