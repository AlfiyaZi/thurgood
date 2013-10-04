var _ = require('underscore');
var assert = require('assert');
var request = require('request');
var setup = require('./setup.js');

describe("GET /servers", function () {
  before(function (done) {
     setup.init(done);
  });

  it("should return all servers", function (done) {
    request.get(setup.testUrl + "/servers", function (err, response, body) {
    	body = JSON.parse(body);
      assert.ok(body.success);
      assert.ok(body.data.length >= 0);
      done();
    });
  });

  it("should return servers by query", function (done) {
    request.get(setup.testUrl + "/servers?limit=2&q={\"name\":\"jeff\"}", function (err, response, body) {
    	body = JSON.parse(body);
      assert.ok(body.success);

      // Check if every object's name value is 'jeff'
      _.each(body.data, function(value) {
      	assert.ok(value.name == 'jeff');
      });

      done();
    });
  });

  it("should return only specified fields", function (done) {
    request.get(setup.testUrl + "/servers?limit=2&fields={\"name\": 1, \"status\": 1}", function (err, response, body) {
    	body = JSON.parse(body);
      assert.ok(body.success);

      // Check if every object has only the 3 correct keys
      _.each(body.data, function(value) {
      	_.each(Object.keys(value), function(key) {
	      	assert.ok(key == 'name' || key == 'status' || key == '_id');
	      });
      });

      done();
    });
  });

  it("should return servers sorted asc", function (done) {
    request.get(setup.testUrl + "/servers?limit=3&sort={\"createdAt\": 1}", function (err, response, body) {
    	body = JSON.parse(body);
      assert.ok(body.success);

      // Check if objects are sorted correctly by createdAt
      var previousTimestamp = 0;

      _.each(body.data, function(value) {
      	assert.ok(value.createdAt >= previousTimestamp);
      	previousTimestamp = value.createdAt;
      });
      
      done();
    });
  });

  it("should return servers sorted desc", function (done) {
    request.get(setup.testUrl + "/servers?limit=3&sort={\"createdAt\": -1}", function (err, response, body) {
    	body = JSON.parse(body);
      assert.ok(body.success);

      // Check if objects are sorted correctly by createdAt
      var previousTimestamp = new Date().getTime();

      _.each(body.data, function(value) {
      	assert.ok(value.createdAt <= previousTimestamp);
      	previousTimestamp = value.createdAt;
      });
      
      done();
    });
  });

  it("should return x servers", function (done) {
    request.get(setup.testUrl + "/servers?limit=2", function (err, response, body) {
    	body = JSON.parse(body);
      assert.ok(body.success);
      assert.ok(body.data.length == 2);
      done();
    });
  });

  it("should skip x servers", function (done) {
    request.get(setup.testUrl + "/servers?limit=3", function (err, response, body) {
    	body = JSON.parse(body);
      assert.ok(body.success);
      
      // Get servers again and compare the responses
      request.get(setup.testUrl + "/servers?skip=1", function (err, response, body2) {
	    	body2 = JSON.parse(body2);
	      assert.ok(body2.success);
	      assert.ok(body.data[1]._id == body2.data[0]._id);
	      done();
	    });
    });
  });
});
