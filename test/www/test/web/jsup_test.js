var abc1 = document.getElementById("abc1");
var abc1_res = document.getElementById("abc1_res");
var abc1_start = document.getElementById("abc1_start");
var cls_btn = document.getElementById("cls_btn");

function testSimpleUpload1() {
	var uer = new jswf.Uer("http://fs.dev.gdy.io/usr/api/uload?token=572856ACBC9A3405159036B7", {}, true);
	uer.AddI("abc1");
	uer.Args.m = "C";
	// console.error("----xx...->\nsss->\n--->\n");
	uer.OnPrepare = function(f, xhr, form) {
		return null;
	};
	uer.OnSuccess = function(f, data, e) {
		if (uer.FindF(f.fid) === null) {
			abc1_res.innerHTML = "file is null";
			return;
		}
		if (uer.FindF("111") !== null) {
			abc1_res.innerHTML = "file is not null";
			return;
		}
		abc1_res.innerHTML = data.data;
		console.log(JSON.stringify(uer.C()));
	};
	uer.OnErr = function(f, data, e) {
		abc1_res.innerHTML = "err:" + JSON.stringify(data);
	};
	cls_btn.addEventListener("click", function(e) {
		uer.DelI("abc1");
		uer.ClearLoaded();
	});
}

function testSimpleUpload2() {
	var uer = new jswf.Uer();
	uer.Url = "../../jsup?kk=1";
	uer.Auto = false;
	uer.Args.m = "C";
	// console.error("----xx...->\nsss->\n--->\n");
	uer.OnPrepare = function(f, xhr, form) {
		console.log(JSON.stringify(uer.C()));
		uer.ClearLoaded();
		return {
			a: 11
		};
	};
	uer.OnStart = function(f, e) {
		console.log(JSON.stringify(uer.C()));
		uer.ClearLoaded();
	};
	uer.OnProcess = function(f, rate, speed, e) {
		console.log(JSON.stringify(uer.C()));
		uer.ClearLoaded();
	};
	uer.OnSuccess = function(f, data, e) {
		abc1_res.innerHTML = data.data;
		uer.ClearLoaded();
	};
	uer.OnErr = function(f, data, e) {
		abc1_res.innerHTML = "err:" + JSON.stringify(data);
	};
	var times = 0;
	abc1.addEventListener("change", function(e) {
		switch (times) {
			case 0:
				uer.Auto = false;
				uer.Add(abc1.files, abc1);
				break;
			case 1:
				uer.Auto = true;
				uer.AddF(abc1.files[0]);
				break;
			default:
				uer.Auto = false;
				uer.AddF(abc1.files[0]);
				break;
		}
		times++;
		console.log(JSON.stringify(uer.C()));
	});
	abc1_start.addEventListener("click", function(e) {
		uer.uloop();
	});
}

function testAbort1() {
	var uer = new jswf.Uer();
	uer.Url = "../../jsup?kk=1";
	// console.error("----xx...->\nsss->\n--->\n");
	uer.OnProcess = function(f, e) {
		uer.Abort("ssss");
		uer.Abort(f.fid);
		console.log(JSON.stringify(uer.C()));
	};
	uer.OnSuccess = function(f, data, e) {
		abc1_res.innerHTML = "ERR";
		console.log(JSON.stringify(uer.C()));
	};
	uer.OnErr = function(f, data, e) {
		abc1_res.innerHTML = "OK";
		console.log(JSON.stringify(uer.C()));
	};
	uer.AddI("abc1");
}

function testErr1() {
	var uer = new jswf.Uer();
	uer.Url = "http://127.0.0.1:12228/sss";
	// console.error("----xx...->\nsss->\n--->\n");
	uer.OnProcess = function(f, e) {};
	uer.OnSuccess = function(f, data, e) {
		abc1_res.innerHTML = "ERR";
		console.log(JSON.stringify(uer.C()));
	};
	uer.OnErr = function(f, data, e) {
		abc1_res.innerHTML = "OK";
		console.log(JSON.stringify(uer.C()));
	};
	uer.AddI("abc1");
}

function testSelectFileErr() {
	var uer = new jswf.Uer();
	uer.Url = "../../jsup?kk=1";
	uer.Auto = true;
	uer.Args.m = "C";
	uer.Minsize = 10;
	uer.Maxsize = 30;
	// console.error("----xx...->\nsss->\n--->\n");
	uer.OnPrepare = function(f, xhr, form) {
		abc1_res.innerHTML = "ERR";
	};
	uer.OnStart = function(f, e) {
		abc1_res.innerHTML = "ERR";
	};
	uer.OnProcess = function(f, rate, speed, e) {
		abc1_res.innerHTML = "ERR";
	};
	uer.OnSuccess = function(f, data, e) {
		abc1_res.innerHTML = "ERR";
	};
	uer.OnErr = function(f, data, e) {
		abc1_res.innerHTML = "ERR";
	};
	var times = 0;
	abc1.addEventListener("change", function(e) {
		times++;
		uer.AddF(abc1.files[0]);
		uer.Add(abc1.files, abc1);
		abc1_res.innerHTML = "" + times;
	});
}

function testSome1() {
	var uer = new jswf.Uer();
	uer.AddI("ssss");
	uer.FindF("sss");
	uer.DelI("sss");
	uer.OnPrepare();
	uer.OnSuccess();
	uer.OnErr();
	uer.OnAbort();
	window.ActiveXObject = window.XMLHttpRequest;
	jswf.NewAjax();
	new jswf();
	uer.onc({
		preventDefault: function() {},
		target: {},
	});
	uer.onc({
		preventDefault: function() {},
		target: {
			uer: {
				OnSelect: function() {
					return null;
				},
			},
			files: [1, 2],
		},
	});
	uer.proc_res({
		status: 200,
		responseText: "{sss}",
	}, {});
}

function testStatusText() {
	// var uer = new jswf.Uer();
	console.log(jswf.Uer.StatusText("P"));
	console.log(jswf.Uer.StatusText("W"));
	console.log(jswf.Uer.StatusText("E"));
	console.log(jswf.Uer.StatusText("A"));
	console.log(jswf.Uer.StatusText("L"));
	console.log(jswf.Uer.StatusText("S"));
	console.log(jswf.Uer.StatusText("X"));
}
//
//
//