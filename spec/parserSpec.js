_ = require('underscore')._,
_s = require('underscore.string');

describe("parser", function () {

	var Parser = require("../lib/parser");

	beforeEach(function () {

	});

	describe("parseFile method", function () {
		it("reads a file and calls toObject on the result", function () {

			var parse = new Parser();
			spyOn(parse, 'toObject');

			parse.parseFile("spec/example_app/example_page.md", function (data) {
				expect(parse.toObject).wasCalled();
				asyncSpecDone();
			});

			asyncSpecWait();
		});

		it("does not call toObject if there was an error reading the file", function () {
			var parse = new Parser();
			spyOn(parse, 'toObject');

			parse.parseFile("spec/-----example_app/example_page.md", function (data) {
				expect(parse.toObject).not.wasCalled();
				expect(data.error).not.toBeUndefined();
				asyncSpecDone();
			});

			asyncSpecWait();
		});
	});

	describe("toObject method", function () {
		it("parses a file to an object", function () {
			new Parser().parseFile("spec/example_app/example_page.md", function (data) {
				expect(data.title).toEqual('foobar');
				expect(_s.include(data.content, "Lorem")).toBe(true);
				expect(data.template).toEqual("blog_page.html");
				asyncSpecDone();
			});

			asyncSpecWait();
		});

		it("gets the title from the filename if no title present", function () {
			new Parser().parseFile("spec/example_app/page_no_title.md", function (data) {
				expect(data.title).toEqual("Page No Title");
				asyncSpecDone();
			});

			asyncSpecWait();
		});

		it("can process files concurrently", function () {
			new Parser().parseFile("spec/example_app/page_no_title.md", function (data) {
				expect(data.title).toEqual("Page No Title");
				asyncSpecDone();
			});

			new Parser().parseFile("spec/example_app/example_page.md", function (data) {
				expect(data.title).toEqual("foobar");
				asyncSpecDone();
			});

			new Parser().parseFile("spec/example_app/page_no_title.md", function (data) {
				expect(data.title).toEqual("Page No Title");
				asyncSpecDone();
			});

			asyncSpecWait();
		});

		it("template defaults to default if not present", function () {
			new Parser().parseFile("spec/example_app/page_no_title.md", function (data) {
				expect(data.template).toEqual("default.html");
				asyncSpecDone();
			});

			asyncSpecWait();
		});

		it("fixes bad variable names", function () {
			var parser = new Parser();
			parser.filePath = "filename.md";
			var result = parser.toObject("   test key : foobar");
			expect(_.has(result, 'testKey')).toBe(true);
		});

		it("can parse single variable", function () {
			var parser = new Parser();
			parser.filePath = "filename.md";
			var result = parser.toObject("content: foobar");
			expect(result.content).toEqual('<p>foobar</p>\n');
		});

		it("splits vars even if whitespace around dilemiter", function () {
			var result = new Parser().toObject("title: foobar\n - \ncontent: hello");
			expect(result.content).toEqual("<p>hello</p>\n");
		});

		it("splits vars even if MULTIPLE whitespace around dilemiter", function () {
			var result = new Parser().toObject("title: foobar\n  -     \ncontent: hello");
			expect(result.content).toEqual("<p>hello</p>\n");
		});

		it("does not assign UNDEFINED to variables left blank", function () {
			var parser = new Parser()
			parser.filePath = "filename-something.md";
			var result = parser.toObject("title:\n-\ncontent:");
			expect(result.content).toEqual("");
			expect(result.title).toEqual("Filename Something");
		});

		it("trims whitespace", function () {
			var result = new Parser().toObject("title:\n  -  \ncontent: hello");
			expect(result.content).toEqual("<p>hello</p>\n");
		});

		it("trims the values of the vars", function () {
			var result = new Parser().toObject('title:    "baby"  & you are    mine ');
			expect(result.title).toEqual('"baby" & you are mine');
			expect(result.urlSlug).toEqual("baby-you-are-mine")
		});
	});

});
