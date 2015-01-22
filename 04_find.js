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

    return teacher;
  });

function filterTeachers(data, day, time, preffered, banned) {
  data = data
    .filter(function(teacher) {
      var daySchedule = teacher.schedule[day] || [];
      return daySchedule.indexOf(time) >= 0;
    });

  function sorter(a, b) {
    var rateA = Array.isArray(a.hourlyRate) ? a.hourlyRate[0] : a.hourlyRate;
    var rateB = Array.isArray(b.hourlyRate) ? b.hourlyRate[0] : b.hourlyRate;

    if (rateA === rateB) {
      return b.sessions - a.sessions;
    } else {
      return rateA - rateB;
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
      return banned.indexOf(teacher.id) === -1;
    })
    .filter(function(teacher) {
      return !!teacher.video;
    })
    .filter(function(teacher) {
      return teacher.sessions > 10;
    })
    .filter(function(teacher) {
      var rate = Array.isArray(teacher.hourlyRate) ? teacher.hourlyRate[0] : teacher.hourlyRate;
      return rate < 150;
    })
    .sort(sorter);
}

function printTeachers(data) {
  var table = new Table({
    head: ['Name', 'Country', 'Rate', 'Sessions', 'Video', 'URL', 'id']
  });

  data.forEach(function(teacher) {
    var rate = Array.isArray(teacher.hourlyRate) ? teacher.hourlyRate[0] : teacher.hourlyRate;
    table.push([
      teacher.name,
      teacher.country,
      rate,
      teacher.sessions,
      teacher.video,
      'http://www.italki.com/teacher/' + teacher.id,
      teacher.id
    ]);
  });

  console.log(table.toString());
}

var mySchedule = [
  ['Monday', '08:30', ['1303245']],
  ['Tuesday', '08:30', ['1552270']],
  ['Wednesday', '08:30', ['697166']],
  ['Thursday', '08:30', ['1328035']],
  ['Friday', '08:30', ['1637166']],
  ['Saturday', '19:00', ['1564172']],
  ['Sunday', '16:30', ['1523529']],
];

var banned = [
  '1002603',
  '1043829',
  '1057033',
  '1078268',
  '1132229',
  '1148700',
  '1175286',
  '1179674',
  '1180870',
  '1278971',
  '1283664',
  '1315342',
  '1322672',
  '1325926',
  '1359638',
  '1360107',
  '1375760',
  '1377208',
  '1377283',
  '1379413',
  '1380225',
  '1390536',
  '1401711',
  '1410350',
  '1413150',
  '1428018',
  '1443150',
  '1459018',
  '1471244',
  '1476350',
  '1486331',
  '1490474',
  '1524373',
  '1526655',
  '1538587',
  '1539415',
  '1539415',
  '1539688',
  '1560019',
  '1565948',
  '1575655',
  '1578399',
  '1581946',
  '1588399',
  '1588994',
  '1589698',
  '1594374',
  '1596119',
  '1600648',
  '1610322',
  '1610484',
  '1646821',
  '1647456',
  '1647867',
  '1676724',
  '1690250',
  '1718973',
  '1733386',
  '1753811',
  '1756283',
  '1789931',
  '342404',
  '346460',
  '795706',
  '803239',
  '837815',
  '899229',
  '965251',
  '983529',
];

mySchedule.forEach(function(row) {
  console.log(row[0].toUpperCase(), row[1]);
  printTeachers(filterTeachers(data, row[0], row[1], row[2], banned));
});

