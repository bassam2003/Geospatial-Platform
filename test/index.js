"use strict";

const expect = require("chai").expect,
	athenaExpress = require("..");

describe("Geospatial-Platform Structure", function() {
	it("should export AthenaExpress constructor from package", function() {
		expect(athenaExpress).to.be.a("function");
		expect(athenaExpress).to.equal(athenaExpress.AthenaExpress);
	});

	it("should export AthenaExpress constructor method directly", function() {
		expect(athenaExpress.AthenaExpress).to.be.a("function");
	});
});
