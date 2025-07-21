---
author: Lee Yunjin
---

# Go Interfaces are not Inheritance


# Overview

Go interfaces allow you to define functions with the same parameters and return types across multiple structs. However, unlike Java’s `extends` keyword, it does not let you automatically extend or override function behaviors. You need to understand Go’s compositional code reuse to avoid confusion with inheritance. Still, it’s hard to grasp this theoretically from the start. Let’s learn through common mistake scenarios.

## Common Mistakes

Beginners may run into issues like this:

```go
package main
import (
    "fmt"
    "strings"
)

type Fruits interface {
    GetBrix() float64
    GetName() string
    SetLabel()
    GetLabel(string) string
    PrintAll()
}

type Apple struct {
    Label string
    Name  string
    Brix  float64
}

type Watermelon struct {
    Label string
    Name  string
    Brix  float64
}

func (a *Apple) PrintAll() {
    fmt.Printf("Fruit: %s, Label: %s, Brix: %v
", a.Name, a.Label, a.Brix)
}

const (
    NO_LABEL = "EMPTY LABEL"
)

func (a *Apple) SetLabel(lbl string) {
    a.Brix  = 14.5
    a.Name  = "apple"
    lbl_lower := strings.ToLower(lbl)
    if strings.Contains(lbl_lower, a.Name) {
        fmt.Println("Succeed: Label was", lbl)
        a.Label = lbl
    } else {
        fmt.Println("Failed: Label was", lbl)
        a.Label = NO_LABEL
    }
}

func (w *Watermelon) SetLabel(lbl string) {
    w.Brix = 10
    w.Name = "watermelon"
    lbl_lower := strings.ToLower(lbl)
    if strings.Contains(lbl_lower, w.Name) {
        w.Label = lbl
    } else {
        w.Label = NO_LABEL
    }
}

func main() {
    fmt.Println("Inheritance test #1")
    apple := new(Apple)
    watermelon := apple
    apple.SetLabel("Apple_1")
    fmt.Println("Apple, before copied to Watermelon")
    apple.PrintAll()
    watermelon.SetLabel("WaterMelon_2")
    fmt.Println("Apple, after copied to Watermelon")
    apple.PrintAll()
    fmt.Println("Watermelon, which inherited Apple's Method")
    watermelon.PrintAll()
}
```

This code seems fine if you assume Go follows traditional inheritance. But its output reveals the truth:

```
Inheritance test #1
Succeed: Label was  Apple_1
Apple, before copied to Watermelon
Fruit: apple, Label: Apple_1, Brix: 14.5
Failed: Label was  WaterMelon_2
Apple, after copied to Watermelon
Fruit: apple, Label: EMPTY LABEL, Brix: 14.5
Watermelon, which inherited Apple's Method
Fruit: apple, Label: EMPTY LABEL, Brix: 14.5
```

The key line is:

```go
watermelon := apple
```

This does **not** convert an Apple to a Watermelon. `watermelon` is just a pointer to the same Apple instance.

Once again, **Go does not follow the traditional concept of inheritance.**

Misunderstanding this leads to meaningless pointer copies, unintended function sharing between unrelated types, and serious logical errors.

So, what would be a better example?

## A Proper Go-style Example

```go
package main
import (
    "fmt"
    "strings"
)

type Fruits interface {
    GetBrix() float64
    GetName() string
    SetLabel()
    GetLabel(string) string
    PrintAll()
}

type BaseFruit struct {
    Name  string
    Brix  float64
}

type Apple struct {
    Label string
    Fruit BaseFruit
}

type Watermelon struct {
    Label string
    Fruit BaseFruit
}

func (b *BaseFruit) PrintAll() {
    fmt.Printf("Fruit: %s, Brix: %v
", b.Name, b.Brix)
}

const (
    NO_LABEL = "EMPTY LABEL"
)

func (a *Apple) SetLabel(lbl string) {
    a.Fruit.Brix  = 14.5
    a.Fruit.Name  = "apple"
    lbl_lower := strings.ToLower(lbl)
    if strings.Contains(lbl_lower, a.Fruit.Name) {
        fmt.Println("Succeed: Label was", lbl)
        a.Label = lbl
    } else {
        fmt.Println("Failed: Label was", lbl)
        a.Label = NO_LABEL
    }
    fmt.Printf("Fruit %s label set to %s
", a.Fruit.Name, a.Label)
    a.Fruit.PrintAll()
}

func (w *Watermelon) SetLabel(lbl string) {
    w.Fruit.Brix = 10
    w.Fruit.Name = "Watermelon"
    lbl_lower := strings.ToLower(lbl)
    if strings.Contains(lbl_lower, w.Fruit.Name) {
        w.Label = lbl
    } else {
        w.Label = NO_LABEL
    }
    fmt.Printf("Fruit %s label set to %s
", w.Fruit.Name, w.Label)
    w.Fruit.PrintAll()
}

func main() {
    apple := new(Apple)
    watermelon := new(Watermelon)
    apple.SetLabel("Apple_1")
    watermelon.SetLabel("WaterMelon_2")
}
```

## Making It *Look Like* Inheritance with Anonymous Embedding

In Go, you can use **anonymous embedding** to simulate inheritance by promoting fields from embedded structs.

```go
type Apple struct {
    Label string
    BaseFruit
}
```

This allows usage like:

```go
w.PrintAll() // instead of w.BaseFruit.PrintAll()
```

This can increase readability, but if you need explicit struct ownership, it's better to avoid it.

## The Key Takeaways from These Examples

```go
w.PrintAll() // auto-promoted via anonymous struct embedding
```

In both examples, key points include:

- Keep `main` minimal and delegate to functions
- Always use distinct instances for distinct structs
- Use inner structs for shared functionality

## Benefits of This Design

- Clear separation of shared vs. unique methods
- Responsibility is well-scoped
- Structurally isolated and maintainable code

Go may be unfamiliar at first due to differences from traditional OOP, but it enables explicit and clean design once you adapt.

## Summary

- Isolate responsibilities clearly
- Split logic by struct, not by class inheritance
- Don’t assume Go methods work like abstract classes
- Write explicitly structured, concrete code

Go favors simple, clear code over classical OOP abstraction. Design step by step, structurally, not extensibly.
