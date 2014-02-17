(function (window) {
	"use strict";

	var document = window.document,
		location = window.location,
		navigator = window.navigator,
		storage = window.localStorage;

	var Router = function () {
		window.addEventListener("hashchange", this.match.bind(this), false);
	};

	var Request = function (callback) {
		this.xhr = new XMLHttpRequest();

		this.xhr.addEventListener("load", callback, false);
		this.xhr.addEventListener("error", callback, false);
	};

	var Template = function (element) {
		var source = element.innerHTML;

		source = source.replace(/\s{2,}/g, "");
		source = source.replace(/\{\{(.*?)\}\}/g, "',$1,'");
		source = source.split("{%").join("');");
		source = source.split("%}").join("a.push('");
		source = "var a=[];a.push('{}');return a.join('');".format(source);

		this.range = document.createRange();
		this.source = new Function(source);
	};

	var $ = window.$ = {
		endpoint: "https://hku-timetable.herokuapp.com/{group}/{date}",
		days: {},
		date: new Date(),
		main: function () {
			this.router = new Router();
			this.request = new Request(this.callback);

			this.list = new Template(window.list);
			this.again = new Template(window.again);

			this.days[this.date.getDate()] = "Today";
			this.days[this.date.getDate() + 1] = "Tomorrow";
			this.days[this.date.getDate() - 1] = "Yesterday";

			this.router.match();

			if (/iPod|iPhone/.test(navigator.userAgent) && !navigator.standalone) {
				window.add.classList.add("show");
			}

			window.group.addEventListener("change", this.changeGroup, false);
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
		parse: function (data) {
			return data && (data = JSON.parse(data)) ? data.map(function (day) {
				return {
					date: new Date(day.date),
					blocks: day.blocks.map(function (block) {
						return {
							from: new Date(block.from),
							to: new Date(block.to),
							lessons: block.lessons
						}
					})
				}
			}) : false;
		},
		callback: function () {
			var content = window.root.children[0],
				data = $.parse(this.response),
				render = this.status === 200 && data ?
					$.list.render(window.root, data) : $.again.render(window.root);

			window.root.classList.remove("loading");

			if (content === undefined) {
				window.root.appendChild(render);
			} else {
				window.root.replaceChild(render, content);
			}

			$.scrollToToday();
		}
	};

	Request.prototype.get = function (parameters) {
		window.root.classList.add("loading");

		this.xhr.open("GET", $.endpoint.format(parameters), true);
		this.xhr.setRequestHeader("Accept", "application/json");
		this.xhr.send(null);
	};

	Router.prototype.match = function () {
		var hash = location.hash.split("#!/")[1];

		if (hash !== undefined) {
			this.route = hash.split("/");

			$.request.get({
				group: this.route[0],
				date: this.route[1] || $.date.format("d-m-Y")
			});

			window.group.value = this.route[0];
		} else {
			location.hash = "#!/{}".format(storage.group || "GDD1-B");
		}
	};

	Template.prototype.render = function (parent, data) {
		this.range.selectNode(parent);
		return this.range.createContextualFragment(this.source.call(data));
	};

	window.addEventListener("DOMContentLoaded", $.main.bind($), false);
})(this);