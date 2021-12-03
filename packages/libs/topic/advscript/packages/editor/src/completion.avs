Characters: 
 - Foo (bar, bar2)
 - Foo2 (bar3)

Macros: 
 - bar (Foo) foo
 - bar2 (Foo2) foo2=true
 - pipe (Foo) foo

Hello: Bar!
---

|let foo = 1, bar = 2

inlineAt: [@Foo]

@Foo (bar)[bar|bar]
(foo:bar)
foo[bar](bar foo)
[bar foo=foo bar="bar]foo" foo]

|if bar > 0

barbarbar

|end

test[[comment]]in*line**bo*ld{{"template" | pipe}}con>33[\[label](pipe foo=1) <tentaft*|pipe
test[[comment]]in*line**bo*ld{{"template" | pipe}}con>4 [\[label\]](pipe) <tentaft*|pipe
