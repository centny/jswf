package srv

import (
	"os"
	"testing"
)

func TestRun(t *testing.T) {
	s_igtest = true
	RunSrv(os.Args)
}
