var locale = require("locale");
/* jshint esversion: 6 */
const timeFontSize = 4;
const dateFontSize = 3;
const smallFontSize = 2;
const font = "6x8";

const xyCenter = g.getWidth() / 2;
const yposTime = 50;
const yposDate = 85;
const yposTst = 115;
const yposDml = 170;
const yposDayMonth = 195;
const yposGMT = 220;

// Timestamp
const endConfinement = new Date(2020, 4, 11);

// Check settings for what type our clock should be
var is12Hour = (require("Storage").readJSON("setting.json", 1) || {})["12hour"];

let pad2 = number => number <= 10 ? `0${number}`.slice(-2) : number;


function getUTCTime (d) {
  return d.toUTCString().split(' ')[4].split(':').map(function (d) { return Number(d) });
}

function drawSimpleClock () {
  // get date
  var d = new Date();
  var da = d.toString().split(" ");
  var dutc = getUTCTime(d);

  g.reset(); // default draw styles
  // drawSting centered
  g.setFontAlign(0, 0);

  // draw time
  var time = da[4].split(":");
  var hours = time[0],
    minutes = time[1],
    seconds = time[2];

  var meridian = "";
  if (is12Hour) {
    hours = parseInt(hours, 10);
    meridian = "AM";
    if (hours == 0) {
      hours = 12;
      meridian = "AM";
    } else if (hours >= 12) {
      meridian = "PM";
      if (hours > 12) hours -= 12;
    }
    hours = (" " + hours).substr(-2);
  }

  // Time
  g.setFont(font, timeFontSize);
  g.drawString(`${hours}:${minutes}:${seconds}`, xyCenter, yposTime, true);
  g.setFont(font, smallFontSize);
  g.drawString(meridian, xyCenter + 102, yposTime + 10, true);

  // Date String
  g.setFont(font, dateFontSize);
  g.drawString(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, xyCenter, yposDate, true);


  // End of confinement
  var eoc = Math.round((endConfinement.getTime() - d.getTime()) / 1000);

  var eocDays = Math.floor(eoc / 86400);
  var remaining = eoc - (eocDays * 86400);
  var eocHours = Math.floor(remaining / 3600);
  remaining = remaining - eocHours * 3600;
  var eocMins = Math.floor(remaining / 60);
  remaining = remaining - eocMins * 60;
  var eocSecs = Math.floor(remaining);


  g.setFont(font, smallFontSize);
  //g.drawString(`end:${tst}`, xyCenter, yposTst, true);
  g.drawString(`EOC ${pad2(eocDays)}d ${pad2(eocHours)}h ${pad2(eocMins)}m ${pad2(eocSecs)}s`, xyCenter, yposTst, true);

  //Days in month
  var dom = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

  //Days since full moon
  var knownnew = new Date(2020, 02, 24, 09, 28, 0);

  // Get millisecond difference and divide down to cycles
  var cycles = (d.getTime() - knownnew.getTime()) / 1000 / 60 / 60 / 24 / 29.53;

  // Multiply decimal component back into days since new moon
  var sincenew = (cycles % 1) * 29.53;

  // Draw days in month and sime since new moon
  g.setFont(font, smallFontSize);
  g.drawString(`md:${dom} l:${sincenew.toFixed(2)}`, xyCenter, yposDml, true);

  // draw Month name, Day of the week and beats
  var beats = Math.floor((((dutc[0] + 1) % 24) + dutc[1] / 60 + dutc[2] / 3600) * 1000 / 24);
  g.setFont(font, smallFontSize);
  g.drawString(`m:${locale.month(d, true)} d:${locale.dow(d, true)} @${beats}`, xyCenter, yposDayMonth, true);

  // draw gmt
  var gmt = da[5];
  g.setFont(font, smallFontSize);
  g.drawString(gmt, xyCenter, yposGMT, true);
}

// handle switch display on by pressing BTN1
Bangle.on('lcdPower', function (on) {
  if (on) drawSimpleClock();
});

// clean app screen
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

// refesh every 100 milliseconds
setInterval(drawSimpleClock, 100);

// draw now
drawSimpleClock();

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });