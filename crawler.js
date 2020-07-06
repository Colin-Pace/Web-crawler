// A web crawler that collects and displays titles

const request = require('request');
const cheerio = require('cheerio');
const startURL = "https://www.npr.org/";
const url = new URL(startURL);
const baseUrl = url.protocol + "//" + url.hostname;
const visited = {};
const toVisit = [];
const titles = [];
const visitLimit = 10;
let visitedCount = 0;
let result = false;

function crawl() {
  const visitPage = function(url, crawl) {
    visited[url] = true;
    visitedCount++;

    const collectLinks = function(text) {
      const links = text("a[href^='/']");
      links.each(function() {
        toVisit.push(baseUrl + text(this).attr('href'));
      });
    }

    console.log(`Visiting: ${url}\n`);
    request(url, function(error, response, body) {
      if (response.statusCode !== 200) {
        console.log("Status code: " + response.statusCode);
        return crawl();

      } else {
        const text = cheerio.load(body);
        const title = text("title").text();
        titles.push(title);
        collectLinks(text);
        return crawl();
      }
    });
  }

  if (visitedCount === visitLimit) result = true;
  if (result === true) console.log(titles);

  if (visitedCount >= visitLimit) return;
  else {
    const nextPage = toVisit.pop();
    if (nextPage in visited) return crawl();
    else visitPage(nextPage, crawl);
  }
}

toVisit.push(startURL);
crawl();
