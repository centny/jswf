#!/bin/bash
##############################
#####Setting Environments#####
pkgs="\
 io.vty.jsup/jsup\
"
ig_cpkgs="io.vty.jsup/jsup"
ig_pkg="io.vty.jsup/srv"
ig_n="srv.test"
main_n="jsup"
main_pkg="io.vty.jsup/main"
set -e
ftp_arg="-a"
u_n=`uname`
case $u_n in
 MINGW*)
  main_n="jsup.exe"
  ftp_arg="-A"
  if [ $GOPATH != "" ];then
   export GOPATH=`pathc -w2p $GOPATH`
  fi
  ;;
esac
export PWD=`pwd`
export LD_LIBRARY_PATH=/usr/local/lib
export PATH=$PATH:$GOPATH/bin:$HOME/bin:$GOROOT/bin:$PWD/bin
export GOPATH=$PWD:$GOPATH
export B_DIR=$PWD/build
export GO_B_DIR=$B_DIR/go
export JS_B_DIR=$B_DIR/js
export WS_B_DIR=$B_DIR/ws
###
init_js(){
	echo "Setting JS Environments"
	rm -rf $JS_B_DIR
	mkdir $JS_B_DIR
	mkdir $JS_B_DIR/e2e
	mkdir $JS_B_DIR/uni
	mkdir $JS_B_DIR/all
}
init(){
	echo "Setting Environments"
	rm -rf $B_DIR
	mkdir $B_DIR
	mkdir $GO_B_DIR
	mkdir $JS_B_DIR
	mkdir $WS_B_DIR
	mkdir $WS_B_DIR/bin
	init_js
}
##############################
##### Running Unit Test ######
unit_test(){
	echo "Running Go Unit Test"
	echo "mode: set" > $GO_B_DIR/a.out
	for p in $pkgs;
	do
	 echo $p
	 go test -v --coverprofile=$GO_B_DIR/c.out $p
	 cat $GO_B_DIR/c.out | grep -v "mode" >>$GO_B_DIR/a.out
	done
	rm -f $GO_B_DIR/c.out
}

##############################
######## Build Exec ##########
build_ig(){
	echo "Build Executable"
	go test $ig_pkg  -c -i -cover -coverpkg $ig_cpkgs
	cp $ig_n* $WS_B_DIR/bin
  cp -r conf $WS_B_DIR
}
build_main(){
	echo "Build Main"
	go build -o $main_n $main_pkg
}
##############################
##Instrument Js And Web Page##
instrument(){
	echo "Instrument Js And Web Page"
	cp -r www $WS_B_DIR
  # ln -s $PWD/../lib/jsup.js $PWD/www/js
	istanbul instrument --prefix $PWD/www --output $WS_B_DIR/www -x lib/** -x test/** www
	jcr app -d www -o $WS_B_DIR/www -ex www/lib/.*,tpl/.*
}
##############################
######## Run Grunt############
web_test(){
	echo "Running Web Testing"
	grunt --force
}

##############################
#####Create Coverage Report###
gocov_unit(){
  gocov convert $GO_B_DIR/a.out > $GO_B_DIR/coverage_a.json
  cat $GO_B_DIR/coverage_a.json | gocov-xml -b $PWD/src > $GO_B_DIR/coverage_a.xml
  cat $GO_B_DIR/coverage_a.json | gocov-html $GO_B_DIR/coverage_a.json > $GO_B_DIR/coverage_a.html
}
gocov_ig(){
  gocov convert $GO_B_DIR/ig.out > $GO_B_DIR/coverage_ig.json
  cat $GO_B_DIR/coverage_ig.json | gocov-xml -b $PWD/src > $GO_B_DIR/coverage_ig.xml
  cat $GO_B_DIR/coverage_ig.json | gocov-html $GO_B_DIR/coverage_ig.json > $GO_B_DIR/coverage_ig.html
}
gocov_repo(){
	echo "Create Coverage Report"
	mrepo $GO_B_DIR/all.out $GO_B_DIR/a.out $GO_B_DIR/ig.out

  gocov_unit

  gocov_ig

	gocov convert $GO_B_DIR/all.out > $GO_B_DIR/coverage.json
	cat $GO_B_DIR/coverage.json | gocov-xml -b $PWD/src > $GO_B_DIR/coverage.xml
	cat $GO_B_DIR/coverage.json | gocov-html $GO_B_DIR/coverage.json > $GO_B_DIR/coverage.html
}
js_repo(){
	cd www
	istanbul report --root=$JS_B_DIR --dir=$JS_B_DIR/all cobertura
	istanbul report --root=$JS_B_DIR --dir=$JS_B_DIR/all html
	cd ../
}
m_repo(){
	mcobertura -o $B_DIR/coverage.xml $JS_B_DIR/all/cobertura-coverage.xml $GO_B_DIR/coverage.xml
}
pub(){
  ftp $ftp_arg 192.168.1.14 <<EOF
  cd cmd
  binary
  put $main_n
EOF
}
dload(){
  ftp $ftp_arg 192.168.1.14 <<EOF
  cd cmd
  binary
  get $main_n
EOF
}

case $1 in
 "main")
  init
  build_main
 ;;
 "igr")
  init
  build_ig
 ;;
 "pub")
  build_main
  pub
 ;;
 "update")
  rm -f $main_n
  dload
 ;;
 "rsrv")
  init
  cp $main_n $WS_B_DIR/bin
  grunt w_srv
 ;;
 "re2e")
  init_js
  instrument
  grunt r_e2e
  js_repo
 ;;
 "runi")
  init_js
  grunt r_uni
  js_repo
 ;;
 "wuni")
  init_js
  grunt r_uni
  js_repo
 ;;
 "guni")
  init
  unit_test
  gocov_unit
 ;;
 "dweb")
  init
  cp $main_n $WS_B_DIR/bin
  instrument
  grunt d_web
  js_repo
 ;;
 "ig")
  init
  build_ig
  build_main
  instrument
  web_test
  grunt --force g_e2e
  js_repo
  ;;
 "all")
  init
  unit_test
  build_ig
  build_main
  instrument
  web_test
  gocov_repo
  js_repo
  m_repo
  ;;
 *)
  echo "Usage: ./build.sh cmd
  main	build main
  igr  build igr
  rsrv	run all server
  re2e	run e2e test by manual(only e2e)
  wuni	run web unit test
  guni  run go unit test
  dweb	run all web test(auto start test server)
  pub	publish the executable
  update download the new version executable
  all	run all"
  ;;
esac
