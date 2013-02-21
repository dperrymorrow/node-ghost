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

			parse.parseFile("spec/fixtures/example_page.md", function (data) {
				expect(parse.toObject).wasCalled();
				asyncSpecDone();
			});

			asyncSpecWait();
		});

		it("does not call toObject if there was an error reading the file", function () {
			var parse = new Parser();
			spyOn(parse, 'toObject');

			parse.parseFile("spec/-----fixtures/example_page.md", function (data) {
				expect(parse.toObject).not.wasCalled();
				expect(data.error).not.toBeUndefined();
				asyncSpecDone();
			});

			asyncSpecWait();
		});
	});

	describe("toObject method", function () {
		it("parses a file to an object", function () {
			new Parser().parseFile("spec/fixtures/example_page.md", function (data) {
				expect(data.title).toEqual('foobar');
				expect(_s.include(data.content, "Lorem")).toBe(true);
				expect(data.template).toEqual("blog_page.html");
				asyncSpecDone();
			});

			asyncSpecWait();
		});

		it("gets the title from the filename if no title present", function () {
			new Parser().parseFile("spec/fixtures/page_no_title.md", function (data) {
				expect(data.title).toEqual("Page no title");
				asyncSpecDone();
			});

			asyncSpecWait();
		});

		it("can process files concurrently", function () {
			new Parser().parseFile("spec/fixtures/page_no_title.md", function (data) {
				expect(data.title).toEqual("Page no title");
				asyncSpecDone();
			});

			new Parser().parseFile("spec/fixtures/example_page.md", function (data) {
				expect(data.title).toEqual("foobar");
				asyncSpecDone();
			});

			new Parser().parseFile("spec/fixtures/page_no_title.md", function (data) {
				expect(data.title).toEqual("Page no title");
				asyncSpecDone();
			});

			asyncSpecWait();
		});

		it("template defaults to default if not present", function () {
			new Parser().parseFile("spec/fixtures/page_no_title.md", function (data) {
				expect(data.template).toEqual("default.html");
				asyncSpecDone();
			});

			asyncSpecWait();
		});

		it("splits vars even if whitespace around dilemiter", function () {
			var result = new Parser().toObject("title: foobar\n - \ncontent: hello", "fruitcake.md");
			expect(result.content).toEqual("hello");
		});

		it("splits vars even if MULTIPLE whitespace around dilemiter", function () {
			var result = Parser().toObject("title: foobar\n  -  \ncontent: hello", "fruitcake.md");
			expect(result.content).toEqual("hello");
		});

		it("does not assign UNDEFINED to variables left blank", function () {
			var result = new Parser().toObject("title:\n-\ncontent:", "fruitcake.md");
			expect(result.content).toEqual("");
		});

		it("trims the values of the vars", function () {
			var result = new Parser().toObject("title:    baby    ", "fruitcake.md");
			expect(result.title).toEqual("baby");
		});
	});

});