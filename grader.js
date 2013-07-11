#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    // parse infile
    // if http... restler
    restler.get(apiurl).on('complete', response2console);
    // else 
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioRestResult = function(result) {
    return cheerio.load(result);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(cheerobj, checksfile) {
    $ = cheerobj;
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var doRetardedJsonThingy = function(cheerobj) {
    var checkJson = checkHtmlFile(cheerobj, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    return outJson;
}

var getPage = function(inurl) {
    rest.get(inurl.toString()).on('complete', function(result, response) {
        if (result instanceof Error) {
            console.log('Error: ' + response.message);
            this.retry(5000); // try again after 5 sec
        } else {
            //console.log(result);
            var cheerobj = cheerioRestResult(result);
            console.log(doRetardedJsonThingy(cheerobj));
         }
    });
};

var getFile = function(filename) {
        var cheerobj = cheerioHtmlFile(program.file);
        console.log(doRetardedJsonThingy(cheerobj));
}


if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --apiurl <url>', 'URL')
        .parse(process.argv);
    if (program.apiurl) {
        getPage(program.apiurl);
    } else {
        getFile(program.file);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
