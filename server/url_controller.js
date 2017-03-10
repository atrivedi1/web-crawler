'use strict'

var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var phoneNumberRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
var phoneNubmersByPagesVisited = {};
var pagesToVisit = [];

function visitPage(url, baseUrl, callback, res) {
  // Add page/numbers to our set
  phoneNubmersByPagesVisited[url] = {};

  // Make the request
  console.log("Visiting page " + url);

  request(url, function(error, response, html) {
     // Check status code (200 is HTTP OK)
     if(response.statusCode !== 200) {
       callback(pagesToVisit, res);
       return;
     }
     // Parse the document body
     var $ = cheerio.load(html);

     collectPhoneNumbers($, url);
     collectInternalLinks($, baseUrl);
     // In this short program, our callback is just calling crawl()
     callback(pagesToVisit, res);
  });
}

function collectPhoneNumbers($, url) {
    $('body').find('div').each(function(i, element) {
        var el = $(this);
        var elementText = el.text();

        if(phoneNumberRegex.test(elementText)) {
            var phoneNumber = elementText.match(phoneNumberRegex).slice(0,1)[0];
            phoneNubmersByPagesVisited[url][phoneNumber] = true;
        }
    })
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

function recursiveCrawler(pagesToVisit, res) {
        if(pagesToVisit.length === 0) {
            console.log("done recursively crawling!", Object.keys(phoneNubmersByPagesVisited).length);
            res.send(phoneNubmersByPagesVisited).status(200);
            return;
        }

        var nextPage = pagesToVisit.pop();
        var nextUrl = new URL(nextPage);
        var baseUrl = nextUrl.protocol + "//" + nextUrl.hostname;

        if (nextPage in phoneNubmersByPagesVisited) {
            // We've already visited this page, so repeat the crawl
            console.log("already visited page! ", nextPage)
            recursiveCrawler(pagesToVisit, res);
        } 
        
        else {
            // New page we haven't visited
            visitPage(nextPage, baseUrl, recursiveCrawler, res);
        }
}
 
module.exports = {
    crawl: function (req, res, cb) {
        console.log("firing crawl");
        var startingURLs = req.body.urls;

        startingURLs.forEach(function(url){
            pagesToVisit.push(url);
        });
        
        recursiveCrawler(pagesToVisit, res);
    }
}

