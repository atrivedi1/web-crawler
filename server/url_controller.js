'use strict'

var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var phoneNumberRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
var phoneNubmersByPagesVisited = {};
var pagesToVisit = [];

function visitPage(url, baseUrl, callback) {
  // Add page/numbers to our set
  phoneNubmersByPagesVisited[url] = [];

  // Make the request
  console.log("Visiting page " + url);

  request(url, function(error, response, body) {
     // Check status code (200 is HTTP OK)
     if(response.statusCode !== 200) {
       callback(pagesToVisit);
       return;
     }
     // Parse the document body
     var $ = cheerio.load(body);
     collectPhoneNumbers($, url);
     collectInternalLinks($, baseUrl);
     // In this short program, our callback is just calling crawl()
     callback(pagesToVisit);

  });
}

function collectPhoneNumbers($, url) {

}

function collectInternalLinks($, baseUrl) {
    var relativeLinks = $("a[href^='/']");
    console.log("Found " + relativeLinks.length + " relative links on page");
    
    if(relativeLinks) {
        relativeLinks.each(function(url) {
            pagesToVisit.push(baseUrl + $(this).attr('href'));
        });
    }
}

function recursiveCrawler(pagesToVisit) {
        if(pagesToVisit.length === 0) {
            console.log("done recursively crawling!", Object.keys(phoneNubmersByPagesVisited).length);
            return;
        }

        var nextPage = pagesToVisit.pop();
        var nextUrl = new URL(nextPage);
        var baseUrl = nextUrl.protocol + "//" + nextUrl.hostname;

        if (nextPage in phoneNubmersByPagesVisited) {
            // We've already visited this page, so repeat the crawl
            console.log("already visited page! ", nextPage)
            recursiveCrawler(pagesToVisit);
        } 
        
        else {
            // New page we haven't visited
            visitPage(nextPage, baseUrl, recursiveCrawler);
        }
}
 
module.exports = {
    crawl: function (req, res, cb) {
        console.log("firing crawl");
        var startingURLs = req.body.urls;
        
        startingURLs.forEach(function(url){
            pagesToVisit.push(url);
        });

        recursiveCrawler(pagesToVisit);
        res.send(200);
    }
}

