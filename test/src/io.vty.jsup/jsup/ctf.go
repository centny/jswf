package jsup

import (
	"fmt"
	"github.com/Centny/gwf/routing"
)

type Item struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
	Desc string `json:"desc"`
}

func ListBook(hs *routing.HTTPSession) routing.HResult {
	is := []Item{}
	for i := 0; i < 10; i++ {
		it := Item{}
		it.Id = i
		it.Name = fmt.Sprintf("bk-%d", i)
		is = append(is, it)
	}
	return hs.MsgRes(is)
}

func ListChapter(hs *routing.HTTPSession) routing.HResult {
	var id int64 = 0
	err := hs.ValidRVal(`
		id,R|I,R:-1~10
		`, &id)
	if err != nil {
		return hs.MsgResE(1, err.Error())
	}
	is := []Item{}
	for i := 0; i < 10; i++ {
		it := Item{}
		it.Id = i
		it.Name = fmt.Sprintf("ch-%d-%d", id, i)
		is = append(is, it)
	}
	return hs.MsgRes(is)
}

func RecF(hs *routing.HTTPSession) routing.HResult {
	_, sha, _, err := hs.RecF2("file", "/tmp/")
	if err == nil {
		fmt.Println("receive file:", sha)
		return hs.MsgRes(sha)
	} else {
		fmt.Println("receive file err:", err.Error())
		return hs.MsgResErr2(1, "arg-err", err)
	}
}

// func StoreCoverage(hs *routing.HTTPSession) routing.HResult {
// 	var cover string = ""
// 	err := hs.ValidRVal(`
// 		cover,R|S,L:0
// 		`, &cover)
// 	if err != nil {
// 		return hs.MsgResE(1, err.Error())
// 	}
// 	log.I("receiving coverage...")
// 	time.Sleep(10 * time.Second)
// 	log.I("receiving coverage end...")
// 	err = util.FWrite("coverage.json", cover)
// 	if err != nil {
// 		return hs.MsgResE(1, err.Error())
// 	} else {
// 		return hs.MsgRes("SUCCESS")
// 	}
// }
