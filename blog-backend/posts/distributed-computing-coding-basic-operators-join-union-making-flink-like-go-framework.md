---
author: Lee Yunjin (@GoSuda Rivulet)
---

# [Distributed Computing] Coding Basic Operators: Join, Union (Making Flink-like Go Framework)

## [HEADLET] Declaring differences between Union and Join
Pull Request opened at 28, July, Mon.
### Union
- Streams with a <font style="color:slateblue"><b>same</b></font> handler
- It should get many subjects

### Join
- Streams with <font style="color:coral"><b>different</b></font> handlers
- It should match correct handlers

#### Retrieving handlers and streams with two arrays is a bad idea
- It can occur **out of bounds error** without detailed avoidance logic
- Handlers and Streams should have same sizes: **1:1 Function matching, duplicated handler declaration is required**

### Let's Implement: Start from Basics

#### Declare an Interface and a type
```go

type SubjectHandlerMap map[string]nats.MsgHandler

type HeadletConnman interface {
        PublishOnce([]byte, string) error
        PublishWithIntervals([]byte, string, int) 
        AddSubscription(string, nats.MsgHandler) (*nats.Subscription, error) // for general use, it returns *nats.Subscription. It can be useless if wrapper functions are properly developed.
        Union([]string, nats.MsgHandler) (int, []*nats.Subscription, []error) 
        //Join should use map to match correct handler by each subject
        Join(SubjectHandlerMap) (int, []*nats.Subscription, []error)

}
```
- Declare Subject-Handler map as a type
- Declare an interface(It is good for Mock tests)

Mock test functions can be easily implemented by returning nil or dummy structure.


#### Bare-bone implementation


```go
package headlet

import (
        "log"
        "time"
        "github.com/nats-io/nats.go"
)

func (h *Headlet) PublishOnce(msg []byte, subject string) error {
        err := h.conn.Publish(subject, msg)
        if err != nil {
                log.Printf("Failed to publish a subject {%s} from {%s}. error: (%v)", subject, h.conn.LocalAddr(), err)
        }
        return err
}

func (h *Headlet) PublishWithIntervals(msg []byte, subject string, interval int) {
        go func() {
                for {
                        h.PublishOnce(msg, subject)
                        time.Sleep(time.Millisecond * time.Duration(interval))
                }
        }()
}

func (h *Headlet) AddSubscription(subject string, handler nats.MsgHandler) (*nats.Subscription, error) {
        sub, err := h.conn.Subscribe(subject, handler)
        if err != nil {
                log.Printf("Failed to subscribe a subject {%s} from {%s}. error: (%v)", subject, h.conn.LocalAddr(), err)
        }
        return sub, err
}

func (h *Headlet) Union(subjects []string, handler nats.MsgHandler) (int, []*nats.Subscription, []error) { // single handler for union. Join should be implemented for different handlers
        // TODO: this structure is dangerous. it should be properly implemented before merge
        // ===== RETURN VALUES ===== //
        var n int = 0
        var subs []*nats.Subscription
        var errs []error
        // ======================== //

        for _, subject := range subjects {
                sub, err := h.conn.Subscribe(subject, handler)
                if err != nil {
                        log.Printf("[UNION] Failed to subscribe a subject {%s} from {%s}. error: (%v)", subject, h.conn.LocalAddr(), err)
                        errs = append(errs, err)
                } else {
                        subs = append(subs, sub)
                        n++
                }
        }
        if len(subs) == 0 {
                log.Println("[UNION] All subscriptions failed.")
        } else if n != len(subjects) {
                log.Println("[UNION] Length mismatch: (subscriptions != subscribed)")
        }
        return n, subs, errs 
}

func(h *Headlet) Join(subMap SubjectHandlerMap) (int, []*nats.Subscription, []error) {
        var n int = 0
        var subs []*nats.Subscription
        var errs []error
        for subject, handler := range subMap {
                sub, err := h.conn.Subscribe(subject, handler)
                if err != nil {
                        log.Printf("[JOIN] Failed to subscribe a subject {%s} from {%s}. error: (%v)", subject, h.conn.LocalAddr(), err)
                        errs = append(errs, err)
                } else {
                        subs = append(subs, sub)
                        n++
                }
        }
        if len(subs) == 0 {
                log.Println("[JOIN] All subscriptions failed.")
        } else if n != len(subMap) {
                log.Println("[JOIN] Length mismatch: (subscriptions != subscribed)")
        }
        return n, subs, errs
}
```


- Explicit label, Same log format
- Return Subscriptions for external use
- Don't panic on errors: Just return it


### Test

#### Union

- Made a branch ```flowlet-union-test``` from ```83ead8d```, main.
- Dummy test ok

#### Join
- Made a branch ```flowlet-join-test``` from ```2b907d8```, flowlet-union-test.
- Test with a NATS server(single node): ok

#### Making a single node cluster before testing
```
nats-server -p 4222 --cluster nats://0.0.0.0:6222
```
- ```go test``` ok
- Pushed to ```flowlet-join-test```
