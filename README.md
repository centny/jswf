jsup
===

pure javascript library for upload file by ajax

##Install

```
npm install jsupload
```


##Example

```
var uer = new C4js.Uer("../../jsup", {}, true);
uer.AddI("abc1");
uer.OnPrepare = function(f, xhr, form) {
	return null;
};
uer.OnSuccess = function(f, data, e) {
};
uer.OnErr = function(f, data, e) {
};

```

##Docs
