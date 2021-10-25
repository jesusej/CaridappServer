var should = require("should");
var request = require("request");
var expect = require("chai").expect;
var baseUrl = "https://caridapp.herokuapp.com/historyLine"
var util = require("util");

describe('Return Line', function() {
    it('Returns correct Donations in Line', function(done) {
        request.get({ url: baseUrl },
        function(error, response, body) {
                var bodyObj = JSON.parse(body);
                expect(bodyObj[0].lineID).to.equal(5);
                expect(bodyObj[1].lineID).to.equal(15);
                console.log(body);
            done();
        });
    });
});
