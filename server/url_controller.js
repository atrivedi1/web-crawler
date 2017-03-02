'use strict'

var Url = require('./url_model');
var request = require('request');
var cheerio = require('cheerio');
var Promise = require('bluebird');

//scrapes MarkUp 
function scrapeMarkup(currUrl, html, targetUrls, urlData) {
    var $  = cheerio.load(html);

    //find all urls on page and add to targetUrls
    var a = $.html('a');

    $(a).each(function(){
        var url = $(this).attr('href');
        
        //account for subdomains
        if(url && url[0] === "/") {
            url = currUrl + url;
        }
        
        //push url to targetUrls
        targetUrls.push(url);
    });

    //clean up updated target urls
    var targetUrls = targetUrls.filter(function(address){
        return address && address[0] === "h";
    })

    //TODO: find all phone numbers on page
    var phoneNumberRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    var text = $.html('text');

    //TODO: add phone numbers to newly declared array

    //TODO: add current url and array of phone numbers to db use Url.save
        //TODO: on successful save, add current url and phone numbers to urlData
}

//makes get request to external url and then upon success calls scrapeMarkup;
function makeGetRequest(url, targetUrls, urlData) {

    request(url, function (error, response, html) {
        if(error){
            resolve("Had issue crawling: ", url)
        } else {
            console.log("response from pinging:" + url, html);
            scrapeMarkup(url, html, targetUrls, urlData);
        }
    });
}

module.exports = {
    crawl: function(req, res, cb) {
        //parse data from req.body
        var targetUrls = req.body.urls;
        
        //create response urlData object
        var urlData = {};

        //TODO: FIX PROMISE...
        //return promise to maintain async control flow
        return new Promise(function(resolve, reject){
            //loop through targetUrls (i.e. "horizon"), while it still contains urls
            while(targetUrls.length > 0){
                var currentUrl = targetUrls.pop();

                Url.find({ 'Url': currentUrl }, function(err, urlInfo){
                    if(err) { reject("Problem querying db: ", err); } 
                    
                    else {
                        console.log("successfully queried db")
                        
                        //if url is NOT in db make an external ajax request to url for info
                        if(urlInfo.length === 0) {
                            console.log("nothing found in db for: ", currentUrl);
                            //make exteral request
                            makeGetRequest(currentUrl, targetUrls, urlData);
                        }
                        
                        //otherwise simply add url data to urlData payload
                        else {
                            console.log("url found in db! ", urlInfo);
                            //TODO: add url/phone numbers to urlData payload
                        }
                    }
                });
            };
          
            resolve(urlData);
        })
        .then(function(resultingUrlData){
            console.log("data crawled from web", resultingUrlData);
            res.send(resultingUrlData);
            cb();
         });
    }
}