/*
 * @author Cny
 */
var jswf = (function() {
    function jswf() {}

    jswf.NewAjax = function() {
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        } else {
            return new ActiveXObject("Msxml2.XMLHTTP");
        }
    };
    jswf.FSize = ["B", "KB", "MB", "GB", "TB"];
    //
    jswf.fsize = function(bs) {
        bsize = bs;
        for (var i = 0; i < jswf.FSize.length; i++) {
            if (bsize > 1024) {
                bsize = bsize / 1024;
            } else {
                return bsize.toFixed(1) + jswf.FSize[i];
            }
        }
    };
    //
    function Uer(url, args, auto) {
        if (url) {
            this.Url = url;
        }
        if (args) {
            this.Args = args;
        }
        if (typeof(auto) != 'undefined') {
            this.Auto = auto;
        }
    }
    Uer.SOrder = {
        E: 0,
        A: 1,
        S: 2,
        P: 3,
        W: 4,
        L: 5
    };
    Uer.StatusText = function(s) {
        switch (s) {
            case "P":
                return "Process...";
            case "W":
                return "Pending...";
            case "E":
                return "Error";
            case "A":
                return "Cancel";
            case "L":
                return "Done";
            case "S":
                return "Begin";
        }
        return "";
    };
    //
    Uer.prototype.files = [];
    Uer.prototype.loaded = 0; //upload success.
    Uer.prototype.idc = 0; //upload success.
    Uer.prototype.Auto = true; //if auto upload after select.
    Uer.prototype.Maxsize = 0; //maxsize to transfter.
    Uer.prototype.Minsize = 0; //minsize to transfter.
    Uer.prototype.Uploading = false; //if uploading
    Uer.prototype.Url = ""; //the upload URL.
    Uer.prototype.Fname = "file"; //the form file mark name.
    Uer.prototype.Args = {}; //extern argument to server.
    //get the queue list count message.
    Uer.prototype.C = function() {
        var cval = {
            W: 0,
            P: 0,
            S: 0,
            L: 0,
            E: 0,
            A: 0,
            Speed: "",
            Loaded: this.loaded
        };
        var tspeed = 0;
        for (var i in this.files) {
            var cf = this.files[i];
            if (cf.speed) {
                tspeed += cf.speed;
            }
            switch (cf.Status) {
                case "W":
                    cval.W++;
                    break;
                case "P":
                    cval.P++;
                    break;
                case "S":
                    cval.S++;
                    break;
                case "L":
                    cval.L++;
                    break;
                case "E":
                    cval.E++;
                    break;
                case "A":
                    cval.A++;
                    break;
            }
        }
        cval.Speed = jswf.fsize(tspeed);
        return cval;
    };
    Uer.prototype.sort = function() {
        this.files.sort(function(a, b) {
            return Uer.SOrder[a.Status] > Uer.SOrder[b.Status];
        });
    };
    Uer.prototype.addf = function(f) {
        f.Status = "W";
        f.fid = this.idc++;
        f.speed = f.rate = 0;
        this.files.push(f);
    };
    //add file to queue.
    Uer.prototype.AddF = function(f) {
        var added = [];
        var err = [];
        if (this.Maxsize && f.size > this.Maxsize) {
            err.push(f);
        } else if (this.Minsize && f.size < this.Minsize) {
            err.push(f);
        } else {
            added.push(f);
            this.addf(f);
            this.sort();
        }
        this.OnAdd(added, err);
        if (this.Auto) this.uloop();
        this.sort();
    };
    //add file list to queue.
    Uer.prototype.Add = function(fl, node) {
        var added = [];
        var err = [];
        for (var i = 0; i < fl.length; i++) {
            var f = fl[i];
            if (this.Maxsize && f.size > this.Maxsize) {
                err.push(f);
                continue;
            }
            if (this.Minsize && f.size < this.Minsize) {
                err.push(f);
                continue;
            }
            f.node = node;
            added.push(f);
            this.addf(f);
        }
        this.OnAdd(added, err);
        if (this.Auto) this.uloop();
        this.sort();
        console.log("Uer(auto:" + this.Auto + ") adding file to queue(suc:" + added.length + ", err:" + err.length + ")");
    };
    //adding input listener.
    Uer.prototype.AddI = function(id) {
        var t = document.getElementById(id);
        if (!t) {
            return;
        }
        t.uer = this;
        t.addEventListener("change", this.onc);
        console.log("Uer adding input by id " + id);
    };
    //delete input listener.
    Uer.prototype.DelI = function(id) {
        var t = document.getElementById(id);
        if (!t) {
            return;
        }
        t.uer = undefined;
        t.removeEventListener("change", this.onc);
        console.log("Uer remove input by id " + id);
    };
    //find file object by fid.
    Uer.prototype.FindF = function(fid) {
        for (var i = 0; i < this.files.length; i++) {
            if (this.files[i].fid == fid) {
                return this.files[i];
            }
        }
        return null;
    };
    //clear all loaded file.
    Uer.prototype.ClearLoaded = function() {
        var nary = [];
        for (var i = 0; i < this.files.length; i++) {
            if (this.files[i].Status != "L") {
                nary.push(this.files[i]);
            }
        }
        this.files = nary;
    };
    Uer.prototype.onc = function(e) {
        e.preventDefault();
        var t = e.srcElement || e.target;
        if (t.uer && t.files) {
            var fs = t.uer.OnSelect(t, e);
            if (fs && fs.length) {
                t.uer.Add(fs, t);
            }
        }
        return true;
    };
    Uer.prototype.proc_res = function(xhr, f) {
        if (xhr.status == 200) {
            var resD = null;
            try {
                resD = JSON.parse(xhr.responseText);
            } catch (e) {
                resD = xhr.responseText;
            }
            this.OnSuccess(f, resD, null);
        } else {
            try {
                this.OnErr(f, JSON.parse(xhr.responseText), null);
            } catch (e) {
                this.OnErr(f, xhr.responseText, null);
            }
        }
    };
    Uer.prototype.uloop = function() {
        var f = null;
        for (var i in this.files) {
            var cf = this.files[i];
            if (cf.Status == "W") {
                f = this.files[i];
                break;
            }
        }
        if (!f) {
            return;
        }
        console.log("do uloop for file:" + f.name);
        var xhr = jswf.NewAjax();
        var upload = xhr.upload;
        var uer = this;
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) {
                return;
            }
            uer.proc_res(xhr, f);
        };
        upload.addEventListener("loadstart", function(e) {
            console.log("uloop loadstart for file:" + f.name);
            f.Status = "S";
            f.speed = 0;
            f.preloaded = 0;
            f.pretime = new Date().getTime() / 1000;
            if (f.node)(f.node.uploading = true);
            uer.sort();
            uer.OnStart(f, e);
        }, false);
        upload.addEventListener("progress", function(e) {
            f.Status = "P";
            f.rate = 0;
            if (e.lengthComputable) {
                f.rate = e.loaded / e.total;
            }
            ntime = new Date().getTime() / 1000;
            f.speed = (e.loaded - f.preloaded) / (ntime - f.pretime);
            speed = jswf.fsize(f.speed);
            f.preloaded = e.loaded;
            f.pretime = ntime;
            uer.OnProcess(f, f.rate, speed, e);
        }, false);
        upload.addEventListener("load", function(e) {
            console.log("uloop upload success file:" + f.name);
            f.Status = "L";
            uer.loaded++;
            uer.sort();
            if (f.node) f.node.uploading = false;
            uer.OnLoad(f, e);
            //
            uer.uloop();
        }, false);
        upload.addEventListener("error", function(e) {
            console.log("uloop upload file " + f.name + " error");
            f.Status = "E";
            uer.sort();
            uer.OnErr(f, null, e);
            //
            uer.uloop();
        }, false);
        upload.addEventListener("abort", function(e) {
            console.log("uloop abort file " + f.name);
            f.Status = "A";
            uer.sort();
            uer.OnAbort(f, e);
            //
            uer.uloop();
        }, false);
        f.Status = "P";
        var form = new FormData();
        var uargs = [];
        for (var k in this.Args) {
            uargs.push(k + "=" + this.Args[k]);
        }
        console.log("uloop do prepare file:" + f.name);
        var eargs = this.OnPrepare(f, xhr, form);
        if (eargs) {
            for (k in eargs) {
                uargs.push(k + "=" + eargs[k]);
            }
        }
        // if (this.Fname.length) {
        form.append(this.Fname, f);
        // }
        var rurl = this.Url;
        if (rurl.indexOf("?") < 0) {
            rurl += "?" + uargs.join("&");
        } else {
            rurl += "&" + uargs.join("&");
        }
        console.log("uloop staring upload file:", f);
        xhr.open("POST", rurl);
        if (xhr.overrideMimeType) {
            xhr.overrideMimeType("application/octet-stream");
        }
        xhr.send(form);
        f.Xhr = xhr;
    };
    //abort file transfter.
    Uer.prototype.Abort = function(fid) {
        var found = false;
        for (var i = 0; i < this.files.length; i++) {
            var f = this.files[i];
            if (f.fid == fid && f.Xhr) {
                f.Xhr.abort();
                found = true;
            }
        }
        console.log("Uer abort file by id " + fid + ":" + found);
    };
    //on add file to queue.
    Uer.prototype.OnAdd = function(added, err) {};
    //prepare file transfter.
    Uer.prototype.OnPrepare = function(f, xhr, form) {
        return {};
    };
    //on file start transfter.
    Uer.prototype.OnStart = function(f, e) {};
    //on file transfter process.
    Uer.prototype.OnProcess = function(f, rate, speed, e) {};
    //
    Uer.prototype.OnLoad = function(f, e) {};
    //on file upload success.
    Uer.prototype.OnSuccess = function(f, data, e) {};
    //on file upload error.
    Uer.prototype.OnErr = function(f, data, e) {};
    //on file upload abort.
    Uer.prototype.OnAbort = function(f, e) {};
    //on input select file.
    Uer.prototype.OnSelect = function(item, e) {
        return item.files;
    };
    jswf.Uer = Uer;
    //
    //
    //create one local store by name,limit size.
    function LocStore(name, limit) {
        if (typeof(name) !== "string" || name.trim().length < 1) {
            throw "the name must be string and not empty";
        }
        this.name = name;
        if (limit) {
            if (typeof(limit) !== "number" || limit < 1) {
                throw "the limit must be integer and >0";
            }
            this.limit = limit;
        } else {
            this.limit = 5 * 1024 * 1024;
        }
    }
    //load string data.
    LocStore.prototype.get = function(key) {
        return window.localStorage[this.name + "_" + key];
    };
    //load json data.
    LocStore.prototype.getj = function(key) {
        try {
            var val = this.get(key);
            if (val && val.length) {
                return JSON.parse(val);
            } else {
                return null;
            }
        } catch (e) {
            console.error("get json by key(" + key + ") error:" + e);
            return null;
        }
    };
    //store string data.
    LocStore.prototype.set = function(key, data) {
        data = data + "";
        var val = this.get(key);
        var size = 0;
        if (val) {
            size = this.size() + data.length - val.length;
        } else {
            size = this.size() + data.length;
        }
        if (size > this.limit) {
            return false;
        }
        var idx = this.idx();
        idx[key] = data.length;
        window.localStorage[this.name + "_" + key] = data;
        window.localStorage[this.name + "_size"] = size;
        window.localStorage[this.name + "_idx"] = JSON.stringify(idx);
        return true;
    };
    //store json data.
    LocStore.prototype.setj = function(key, data) {
        return this.set(key, JSON.stringify(data));
    };
    //delete data by key.
    LocStore.prototype.del = function(key) {
        var val = this.get(key);
        if (!val) {
            return false;
        }
        var idx = this.idx();
        delete idx[key];
        window.localStorage.removeItem(this.name + "_" + key);
        //
        window.localStorage[this.name + "_size"] = this.size() - val.length;
        window.localStorage[this.name + "_idx"] = JSON.stringify(idx);
        return true;
    };
    //load stored index.
    LocStore.prototype.idx = function() {
        var idx = window.localStorage[this.name + "_idx"];
        if (idx && idx.length) {
            return JSON.parse(idx);
        } else {
            return {};
        }
    };
    //the store size.
    LocStore.prototype.size = function() {
        var size = window.localStorage[this.name + "_size"];
        if (size) {
            return parseInt(size);
        } else {
            return 0;
        }
    };
    //clear the store
    LocStore.prototype.clear = function() {
        var idx = this.idx();
        for (var i in idx) {
            window.localStorage.removeItem(this.name + "_" + i);
        }
        window.localStorage.removeItem(this.name + "_size");
        window.localStorage.removeItem(this.name + "_idx");
        return true;
    };
    //
    jswf.LocStore = LocStore;
    //default new store impl.
    jswf.NewStore = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        return new LocStore(arg0, arg1);
    };
    //delete local store.
    jswf.DelStroe = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        return new LocStore(arg0, arg1).clear();
    };
    //
    function ParseArgs() {
        var url = window.location.search;
        var args = {};
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                args[strs[i].split("=")[0]] = (strs[i].split("=")[1]);
            }
        }
        return args;
    }
    jswf.ParseArgs = ParseArgs;
    //
    function ParseHash() {
        var url = window.location.hash;
        if (url.indexOf("#") != -1) {
            var str = url.substr(1);
            strs = str.split("/");
            return strs;
        }
        return [];
    }
    jswf.ParseHash = ParseHash;
    //
    //
    window.jswf = jswf;
    return jswf;
})();