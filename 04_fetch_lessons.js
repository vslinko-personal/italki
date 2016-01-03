#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var async = require('async');
var request = require('request');
var cheerio = require('cheerio');

var data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json')).toString());

var count = 0;
async.mapSeries(data, function(teacher, callback) {
  function ret() {
    count++;
    console.log(teacher.name, count, data.length, teacher.id);
    callback(null, teacher);
  }

  if (!!teacher.lessons && !!teacher.tutoring && !!teacher.trial) return ret();

  request('http://www.italki.com/teacher/' + teacher.id, function(err, res, body) {
    if (err) return ret();

    var $ = cheerio.load(body);
    teacher.lessons = [];
    teacher.tutoring = parse($('.schedule_area .sp > div').eq(0));
    teacher.trial = Number($('.schedule_area .tr > div .hourly2').text()) || null;

    function parse($this) {
      if ($this.length === 0) return null;
      return {
        title: $this.find('.title_txt').text(),
        completed: Number($this.find('.des_txt').text().replace(/[^\d]/g, '')),
        price: Number($this.find('.hourly2').text())
      };
    }

    $('.schedule_area .ll > div').each(function() {
      teacher.lessons.push(parse($(this)));
    });

    ret();
  });
}, function(err, data) {
  fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(data));
});
