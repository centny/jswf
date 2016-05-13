package jsup

import (
	"fmt"
	"github.com/Centny/gwf/routing/httptest"
	"testing"
)

func TestList(t *testing.T) {
	// ts := httptest.NewServer(ListBook)
	// fmt.Println(ts.G("/"))

	ts := httptest.NewServer(ListChapter)
	fmt.Println(ts.G("?id=%v", 1))
	fmt.Println(ts.G("?id=%v", 100))
}
