package srv

import (
	"fmt"
	"github.com/Centny/gwf/log"
	"github.com/Centny/gwf/routing"
	"io.vty.jsup/jsup"
	"net/http"
	"sync"
)

var lock sync.WaitGroup
var s_running bool
var s http.Server
var s_igtest bool = false

func run(args []string) {
	defer StopSrv()
	mux := http.NewServeMux()
	mux.Handle("/jsup/", NewSrvMux("/jsup", "www"))

	log.D("running server on %v", "7899")
	s = http.Server{Addr: ":7899", Handler: mux}
	err := s.ListenAndServe()
	if err != nil {
		fmt.Println(err)
	}
	// lock.Done()
}
func NewSrvMux(pre string, www string) *routing.SessionMux {
	sb := routing.NewSrvSessionBuilder("", "/", "fs", 30*60*1000, 10*1000)
	mux := routing.NewSessionMux(pre, sb)
	// mux.ShowLog = true
	//
	mux.HFunc("^/jsup(\\?.*)?$", jsup.RecF)
	mux.HFunc("^/listBk(\\?.*)?$", jsup.ListBook)
	mux.HFunc("^/listCh(\\?.*)?$", jsup.ListChapter)
	// mux.HFunc("^/store(\\?.*)?$", ctf.StoreCoverage)
	if s_igtest {
		mux.HFunc("/exit", exit)
	}
	mux.Handler("^/.*$", http.FileServer(http.Dir(www)))
	//
	return mux
}

//run the server.
func RunSrv(args []string) {
	s_running = true
	lock.Add(1)
	go run(args)
	lock.Wait()
	s_running = false
}

//stop the server.
func StopSrv() {
	if s_running {
		lock.Done()
	}
}

func exit(hs *routing.HTTPSession) routing.HResult {
	log.D("receiving exit command...")
	StopSrv()
	return hs.MsgRes("SUCCESS")
}
