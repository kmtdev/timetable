(function (window) {
	"use strict";

	var document = window.document,
		location = window.location,
		navigator = window.navigator,
		storage = window.localStorage;

	var Router = function () {
		window.addEventListener("hashchange", this.match.bind(this), false);
	};

	var Request = function (endpoint, callback) {
		this.endpoint = endpoint;
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

	var Gesture = function () {
		document.addEventListener("mousedown", Gesture.start.bind(this), false);
		document.addEventListener("mousemove", Gesture.move.bind(this), false);
		document.addEventListener("mouseup", Gesture.end.bind(this), false);
		document.addEventListener("touchstart", Gesture.start.bind(this), false);
		document.addEventListener("touchmove", Gesture.move.bind(this), false);
		document.addEventListener("touchend", Gesture.end.bind(this), false);
	};

	var $ = window.$ = {
		endpoint: "https://hku-timetable.herokuapp.com/{group}/{date}",
		days: {},
		date: new Date(),
		main: function () {
			var n = $.date.format("M"),
				j = $.date.getDate();

			this.gesture = new Gesture();
			this.router = new Router();

			this.request = new Request(
				this.endpoint,
				this.callback.bind(this)
			);

			this.list = new Template(window.list);
			this.again = new Template(window.again);

			this.days[n + (j - 1)] = "Yesterday";
			this.days[n + j] = "Today";
			this.days[n + (j + 1)] = "Tomorrow";

			this.router.match();

			if (/iPod|iPhone/.test(navigator.userAgent) && !navigator.standalone) {
				window.add.classList.add("show");
			}

			window.group.addEventListener("change", this.changeGroup.bind(this), false);
		},
		changeGroup: function (event) {
			event.target.blur();

			storage.group = this.group = event.target.value;
			location.hash = "#!/{}".format(event.target.value);
		},
		scroll: function () {
			var today = document.querySelector(".today");

			if (today !== null) {
				today.scrollIntoView();
			} else {
				root.main.scrollIntoView();
			}
		},
		parse: function (data) {
			return data && (data = JSON.parse(data)) ? data.map(function (day) {
				return {
					date: ($.date = new Date(day.date)),
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
		callback: function (event) {
			var root = window.root,
				content = root.children[0],
				data = this.parse(event.target.response),
				render = event.target.status === 200 && data ?
					this.list.render(root, data) : this.again.render(root);

			root.classList.remove("prev"); // iOS fix
			root.classList.remove("next");
			root.classList.remove("loading");

			if (content === undefined) {
				root.appendChild(render);
			} else {
				root.replaceChild(render, content);
			}

			this.scroll();
		},
		setDate: function (days) {
			this.date = new Date(this.date.getTime() + (days * 24 * 60 * 60 * 1000));
			location.hash = "#!/{}/{}".format(this.group, this.date.format("d-m-Y"));
		}
	};

	Request.prototype.get = function (parameters) {
		window.root.classList.add("loading");

		this.xhr.open("GET", this.endpoint.format(parameters), true);
		this.xhr.setRequestHeader("Accept", "application/json");
		this.xhr.send(null);
	};

	Router.prototype.match = function () {
		var hash = location.hash.split("#!/")[1];

		if (hash !== undefined && (this.route = hash.split("/"))[0]) {
			$.request.get({
				group: this.route[0],
				date: this.route[1] || (new Date()).format("d-m-Y")
			});

			window.group.value = $.group = this.route[0];
		} else {
			location.hash = "#!/{}".format(storage.group || "GDD1-B");
		}
	};

	Template.prototype.render = function (parent, data) {
		this.range.selectNode(parent);
		return this.range.createContextualFragment(this.source.call(data));
	};

	Gesture.start = function (event) {
		var e = event.touches ? event.touches[0] : event;

		this.can = true;
		this.start = { x: e.clientX, y: e.clientY };
	};

	Gesture.move = function (event) {
		var e = event.touches ? event.touches[0] : event;

		if (this.can && Math.abs(e.clientY - this.start.y) < 100) {
			var delta = e.clientX - this.start.x,
				margin = document.body.clientWidth / 3;

			if (delta < -margin) {
				this.can = false;
				window.root.classList.add("next");
				$.setDate(7);
			}

			if (delta > margin) {
				this.can = false;
				window.root.classList.add("prev");
				$.setDate(-7);
			}
		}
	};

	Gesture.end = function () {
		this.can = false;
	};

	window.addEventListener("DOMContentLoaded", $.main.bind($), false);
})(this);