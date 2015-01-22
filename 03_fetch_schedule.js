#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var sprintf = require('sprintf').sprintf;
var async = require('async');

var data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json')).toString());
var cookies = fs.readFileSync(path.join(__dirname, '.cookies')).toString().trim();

var count = 0;
async.mapSeries(data, function(teacher, callback) {
  function ret() {
    count++;
    console.log(count, data.length, teacher.name);
    callback(null, teacher);
  }

  if (!!teacher.schedule) return ret();

  var cmd = "curl 'https://secure.italki.com/api/get_data_py.aspx?method=GetSchedule&sno=T018220800&tno=" + teacher.scheduleId + "&tz=Russian%20Standard%20Time&lt=2&callback=ITALKI.util.sessiontime.onsuccUT&_=1421929349385' -H 'Pragma: no-cache' -H 'Accept-Encoding: gzip, deflate, sdch' -H 'Accept-Language: en-US,en;q=0.8' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.91 Safari/537.36' -H 'Accept: */*' -H 'Referer: http://www.italki.com/teacher/733564' -H 'Cookie: " + cookies + "' -H 'Connection: keep-alive' -H 'Cache-Control: no-cache' --compressed";

  exec(cmd, function(err, js) {
    if (err) return ret();

    teacher.schedule = JSON.parse(js.replace(/^ITALKI\.util\.sessiontime\.onsuccUT\(/, '').replace(/\)$/, ''));

    ret();
  });
}, function(err, data) {
  if (err) return console.error(err);
  fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(data));
});
