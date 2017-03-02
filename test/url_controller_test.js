//TODO: add test...might need to use nock

var httpMock = require('node-mocks-http');
var expect = require('chai').expect;
var urlController = require('../server/url_controller.js');

function buildResponse() {
  return httpMock.createResponse({eventEmitter: require('events').EventEmitter})
}

describe("Url controller", function () {
  var req, res

  //create a response object before every test
  beforeEach(function(done) {
    res = buildResponse();
    done()
  })
  
  //basic happy path test
  it("Correctly returns url when valid data is provided", function(done) {
    req  = httpMock.createRequest({
      method: 'POST',
      url: '/url',

      body: {
      }
    })

    urlController.crawl(req, res, function(err) {
      var url = res._getData();
      expect().to.equal();
      done()
    })
  })
})