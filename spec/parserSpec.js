_ = require('underscore')._,
_s = require('underscore.string');

describe("parser", function () {

	var parser = require("../lib/parser").parser;

	beforeEach(function () {

	});

	describe("parseFile method", function () {
		it("reads a file and calls toObject on the result", function () {
			spyOn(parser, 'toObject');

			parser.parseFile("spec/fixtures/example_page.md", function (data) {
				expect(parser.toObject).wasCalled();
				asyncSpecDone();
			});

			asyncSpecWait();
		});

		it("does not call toObject if there was an error reading the file", function () {
			spyOn(parser, 'toObject');

			parser.parseFile("spec/-----fixtures/example_page.md", function (data) {
				expect(parser.toObject).not.wasCalled();
				expect(data.error).not.toBeUndefined();
				asyncSpecDone();
			});

			asyncSpecWait();
		});
	});

	describe("toObject method", function () {
		it("parses a file to an object", function () {
			parser.parseFile("spec/fixtures/example_page.md", function (data) {
				expect(data.title).toEqual('foobar');
				expect(_s.include(data.content, "Lorem")).toBe(true);
				expect(data.template).toEqual("blog_page.html");
				asyncSpecDone();
			});

			asyncSpecWait();
		});

		it("gets the title from the filename if no title present", function () {
			parser.parseFile("spec/fixtures/page_no_title.md", function (data) {
				expect(data.title).toEqual("Page no title");
				asyncSpecDone();
			});

			asyncSpecWait();
		});

		it("can process files concurrently", function () {
			parser.parseFile("spec/fixtures/page_no_title.md", function (data) {
				expect(data.title).toEqual("Page no title");
				asyncSpecDone();
			});

			parser.parseFile("spec/fixtures/example_page.md", function (data) {
				expect(data.title).toEqual("foobar");
				asyncSpecDone();
			});

			asyncSpecWait();
		});

		it("template defaults to default if not present", function () {
			parser.parseFile("spec/fixtures/page_no_title.md", function (data) {
				expect(data.template).toEqual("default.html");
				asyncSpecDone();
			});

			asyncSpecWait();
		});

		it("splits vars even if whitespace around dilemiter", function () {
			var result = parser.toObject("title: foobar\n - \ncontent: hello", "fruitcake.md");
			expect(result.content).toEqual("hello");
		});

		it("splits vars even if MULTIPLE whitespace around dilemiter", function () {
			var result = parser.toObject("title: foobar\n  -  \ncontent: hello", "fruitcake.md");
			expect(result.content).toEqual("hello");
		});

		it("does not assign UNDEFINED to variables left blank", function () {
			var result = parser.toObject("title:\n-\ncontent:", "fruitcake.md");
			expect(result.content).toEqual("");
		});

		it("trims the values of the vars", function () {
			var result = parser.toObject("title:    baby    ", "fruitcake.md");
			expect(result.title).toEqual("baby");
		});
	});

});