#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var util = require('util');
var Table = require('cli-table');

var data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json')));
data = data.reduce(function(data, item) {
  data[item.id] = item;
  return data;
}, {});
data = Object.keys(data).map(function(key) {
  return data[key];
});

data = data
  .map(function(teacher) {
    var days = teacher.schedule.shift();
    var firstDate = days.pop();
    var times = teacher.schedule.shift();
    var dn0 = teacher.schedule.shift();
    var dn1 = teacher.schedule.shift();
    var dn2 = teacher.schedule.shift();
    var daysTimes = teacher.schedule.shift();
    var dn3 = teacher.schedule.shift();
    var tz = teacher.schedule.shift();
    var dn4 = teacher.schedule.shift();
    var texts = teacher.schedule.shift();

    daysTimes = days.reduce(function(newDaysTimes, day, index) {
      newDaysTimes[day] = daysTimes[index];
      return newDaysTimes;
    }, {});

    teacher.schedule = daysTimes;

    var rates = teacher.lessons.map(function(lesson) { return lesson.price; });
    rates = rates.sort(function(a, b) { return a-b; });
    var median = (function(arr) {
      var mid = Math.ceil(arr.length / 2);
      if (arr.length % 2 === 0) {
        return (arr[mid-1] + arr[mid]) / 2;
      } else {
        return arr[mid-1];
      }
    })(rates);

    teacher.rates = rates;
    teacher.median = median;

    return teacher;
  });

function filterTeachers(data, day, time, preffered, banned) {
  data = data
    .filter(function(teacher) {
      var daySchedule = teacher.schedule[day] || [];
      return daySchedule.indexOf(time) >= 0;
    });

  function sorter(a, b) {
    var rateA = a.score;
    var rateB = b.score;

    if (rateA === rateB) {
      return b.sessions - a.sessions;
    } else {
      return rateB - rateA;
    }
  }

  var filtered = data.filter(function(teacher) {
     return preffered.indexOf(teacher.id) >= 0;
  });

  if (filtered.length > 0) {
    return filtered.sort(sorter);
  }

  return data
    .filter(function(teacher) {
      return banned.indexOf(Number(teacher.id)) === -1;
    })
    .filter(function(teacher) {
      return !!teacher.video;
    })
    .filter(function(teacher) {
      return teacher.sessions > 10;
    })
    .map(function(teacher, index, allTeachers) {
      var maxRate = allTeachers.reduce(function(maxRate, teacher) {
          return maxRate > teacher.median ? maxRate : teacher.median;
      }, 0);
      var minRate = allTeachers.reduce(function(minRate, teacher) {
          return minRate < teacher.median ? minRate : teacher.median;
      }, 100000);
      var maxSessions = allTeachers.reduce(function(maxSessions, teacher) {
          return maxSessions > teacher.sessions ? maxSessions : teacher.sessions;
      }, 0);
      var minSessions = allTeachers.reduce(function(minSessions, teacher) {
          return minSessions < teacher.sessions ? minSessions : teacher.sessions;
      }, 100000);

      var rateScore = 1-((teacher.median-minRate) / (maxRate-minRate));
      var sessionsScore = (teacher.sessions-minSessions) / (maxSessions-minSessions);
      teacher.score = (rateScore + sessionsScore) / 2;

      return teacher;
    })
    .sort(sorter);
}

function printTeachers(data) {
  var table = new Table({
    head: [
      'Id',
      'Name',
      'Video',
      'URL',
      'Rates',
      'Sessions',
      'Score',
    ]
  });

  data.forEach(function(teacher) {
    table.push([
      teacher.id,
      teacher.name,
      teacher.video,
      'http://www.italki.com/teacher/' + teacher.id,
      teacher.rates.join(','),
      teacher.sessions,
      teacher.score,
    ]);
  });

  console.log(table.toString());
}

var mySchedule = [
  //['Monday', '08:30', []],
  ['Tuesday', '09:30', []],
  //['Wednesday', '08:30', []],
  //['Thursday', '08:30', []],
  //['Friday', '08:30', []],
  //['Saturday', '19:00', ['1385841']],
  //['Sunday', '16:30', ['1523529']],
];

var banned = [
  1539415,
  939734,
  1360107,
  1027407,
  1304766,
  1181638,
  1377208,
  1851282,
  1002603,
  1372321,
  1807358,
  1930498,
  1588399,
  899229,
  1723029,
  1524373,
  589462,
  969032,
  1479603,
  1588994,
  1890955,
  1698850,
  1179674,
];

mySchedule.forEach(function(row) {
  console.log(row[0].toUpperCase(), row[1]);
  printTeachers(filterTeachers(data, row[0], row[1], row[2], banned));
});
