package mc

import (
	"io"
	"os/exec"
	"sync"
)

type Server struct {
	cmd    *exec.Cmd
	stdin  io.WriteCloser
	output chan string
	mu     sync.RWMutex
}

func New() *Server {
	return &Server{
		output: make(chan string, 256),
	}
}

func (s *Server) Start(java string, dir string, args ...string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.cmd != nil && s.cmd.Process != nil {
		return nil
	}

	s.cmd = exec.Command(java, args...)
	s.cmd.Dir = dir
	s.cmd.Stdin = nil

	stdout, err := s.cmd.StdoutPipe()
	if err != nil {
		return err
	}

	stderr, err := s.cmd.StderrPipe()
	if err != nil {
		return err
	}

	s.stdin, err = s.cmd.StdinPipe()
	if err != nil {
		return err
	}

	if err := s.cmd.Start(); err != nil {
		return err
	}

	go s.readLoop(stdout, "OUT")
	go s.readLoop(stderr, "ERR")

	return nil
}

func (s *Server) readLoop(r io.Reader, prefix string) {
	buf := make([]byte, 4096)
	for {
		n, err := r.Read(buf)
		if n > 0 {
			s.output <- string(buf[:n])
		}
		if err != nil {
			if err != io.EOF {
				s.output <- prefix + " ERROR: " + err.Error() + "\n"
			}
			break
		}
	}
}

func (s *Server) Stop() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.cmd == nil || s.cmd.Process == nil {
		return nil
	}

	if s.stdin != nil {
		s.stdin.Write([]byte("stop\n"))
	}

	s.cmd.Wait()
	s.cmd = nil

	return nil
}

func (s *Server) Send(line string) error {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if s.stdin == nil {
		return nil
	}

	_, err := s.stdin.Write([]byte(line + "\n"))
	return err
}

func (s *Server) Output() <-chan string {
	return s.output
}

func (s *Server) IsRunning() bool {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return s.cmd != nil && s.cmd.Process != nil
}
