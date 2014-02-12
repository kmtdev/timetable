String.prototype.format = function (data) {
	var i = 0;

	if (typeof data !== "object") {
		data = [].slice.call(arguments);
	}

	return this.replace(/\{(\w+)?\}/g, function (undefined, $1) {
		return data[$1 || i++];
	});
};

Date.prototype.format = function (spec) {
	var ord = Date.ordinals,

		date = this.getDate(),
		day = this.getDay(),
		month = this.getMonth(),
		year = this.getFullYear(),
		hours = this.getHours(),
		twelve = hours % 12 || 12,
		minutes = this.getMinutes(),
		seconds = this.getSeconds(),

		options = {
			d: date < 10 ? "0" + date : date,
			D: Date.days[day].substr(0, 3),
			j: date,
			l: Date.days[day],
			N: day || 7,
			S: date > 3 && date <= 20 ? ord[0] : (ord[date % 10] || ord[0]),
			w: day,
			F: Date.months[month],
			m: month < 10 ? "0" + (month + 1) : (month + 1),
			M: Date.months[month].substr(0, 3),
			n: month + 1,
			t: new Date(year, month + 1, 0).getDate(),
			Y: year,
			y: ("" + year).substr(2, 2),
			a: hours < 12 ? "am" : "pm",
			A: hours < 12 ? "AM" : "PM",
			g: twelve,
			G: hours,
			h: twelve < 10 ? "0" + twelve : twelve,
			H: hours < 10 ? "0" + hours : hours,
			i: minutes < 10 ? "0" + minutes : minutes,
			s: seconds < 10 ? "0" + seconds : seconds
		};

	return spec.replace(/\\?([a-z])/gi, function ($0, $1) {
		return options[$0] !== undefined ? options[$0] : $1;
	});
};

Date.ordinals = ["th", "st", "nd", "rd"];

Date.days = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday"
];

Date.months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
];