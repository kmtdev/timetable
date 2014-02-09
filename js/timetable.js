(function (window) {
	"use strict";

	var document = window.document,
		location = window.location,
		navigator = window.navigator,
		storage = window.localStorage;

	var Request = function (callback) {
		this.xhr = new XMLHttpRequest();
		this.xhr.addEventListener("load", callback, false);
	};

	var Router = function () {
		window.addEventListener("hashchange", this.match.bind(this), false);
	};

	var Template = function (element) {
		var source = element.innerHTML;

		source = source.replace(/\s{2,}/g, "");
		source = source.replace(/\{%=(.*?)%\}/g, "',$1,'");
		source = source.split("{%").join("');");
		source = source.split("%}").join("a.push('");
		source = "var a=[];a.push('{}');return a.join('');".format(source);

		this.constructor = new Function(source);
	};

	var $ = window.$ = {
		endpoint: "http://hku-timetable.eu01.aws.af.cm/:group/:date",
		days: {},
		date: new Date(),
		main: function () {
			this.root = window.root;
			this.group = window.group;

			this.request = new Request(this.requestCallback);
			this.router = new Router();
			this.template = new Template(window.timetable);

			this.days[this.date.getDate()] = "Today";
			this.days[this.date.getDate() + 1] = "Tomorrow";
			this.days[this.date.getDate() - 1] = "Yesterday";

			this.router.match();
			this.group.addEventListener("change", this.changeGroup, false);

			if (!navigator.standalone && /iPod|iPhone|iPad/.test(navigator.userAgent)) {
				window.add.classList.add("show");
			}
		},
		changeGroup: function () {
			this.blur();
			storage.group = this.value;
			location.hash = "#!/{}".format(this.value);
		},
		scrollToToday: function () {
			var today = document.querySelector(".today");

			if (today !== null) {
				today.scrollIntoView();
			}
		},
		parseData: function (data) {
			return JSON.parse(data).map(function (day) {
				return {
					date: new Date(day.date),
					blocks: day.blocks.map(function (block) {
						return {
							from: new Date(block.from),
							to: new Date(block.to),
							lessons: block.lessons
						};
					})
				};
			});
		},
		requestCallback: function () {
			$.root.classList.remove("loading");
			$.root.innerHTML = $.template.render($.parseData(this.response));
			$.scrollToToday();
		}
	};

	Request.prototype.get = function (parameters) {
		$.root.classList.add("loading");

		this.xhr.open("GET", $.endpoint.format(parameters), true);
		this.xhr.setRequestHeader("Accept", "application/json");
		this.xhr.send(null);
	};

	Router.prototype.match = function () {
		var hash = location.hash.split("#!/")[1];

		if (hash !== undefined) {
			this.route = hash.split("/");

			$.group.value = this.route[0];
			$.request.get({
				group: this.route[0],
				date: this.route[1] || $.date.format("d-m-Y")
			});
		} else {
			location.hash = "#!/{}".format(storage.group || "GDD1-B");
		}
	};

	Template.prototype.render = function (data) {
		return this.constructor.call(data);
	};

	window.addEventListener("DOMContentLoaded", $.main.bind($), false);
})(this);