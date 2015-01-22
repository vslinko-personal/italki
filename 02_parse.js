#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var util = require('util');
var cheerio = require('cheerio');

var pagesDir = path.join(__dirname, 'pages');

var data = fs.readdirSync(pagesDir)
  .sort(function(a, b) {
    a = parseInt(a.replace(/[^0-9]/g, ''));
    b = parseInt(b.replace(/[^0-9]/g, ''));
    return a-b;
  })
  .map(function(file) {
    return JSON.parse(fs.readFileSync(path.join(pagesDir, file))).li_text;
  })
  .map(function(html) {
    var $ = cheerio.load(html);
    var items = [];

    $('.gridS').each(function() {
      var $this = $(this);

      var video = $this.find('.icon_video').attr('onclick') || null;
      if (video) {
        video = /http?:\/\/youtu.be\/[-_a-zA-Z0-9]+/.exec(video) || null;
        if (video) {
          video = video[0];
        }
      }

      var rate = $this.find('.or_price').text().replace(/[^-0-9]/g, '').split('-').map(Number);
      if (rate.length === 1) {
        rate = rate.shift();
      }

      var scheduleId = $this.find('.icon_schedule').attr('href')
        .replace(/^javascript:ITALKI\.util\.sessiontime\.GetUserTimeIn\('[^']*', '/, '')
        .replace(/(T[0-9]+).*/, '$1');

      items.push({
        id: $this.attr('exclude'),
        name: $this.find('.title_txtH3').text(),
        country: $this.find('.sortby li').eq(0).text(),
        sessions: Number($this.find('.sortby li').eq(2).text().replace('Sessions: ', '')),
        video: video,
        schedule: null,
        lessons: null,
        hourlyRate: rate,
        trial: Number($this.find('.label.free strong').text().replace(/[^0-9]/g, '')),
        scheduleId: scheduleId
      });
    });

    return items;
  })
  .reduce(function(flat, items) {
    return flat.concat(items);
  }, []);

fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(data));
