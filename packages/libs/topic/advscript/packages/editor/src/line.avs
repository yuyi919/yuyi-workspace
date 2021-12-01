Characters: 
 - Foo (bar, bar2, bar3) display=!Foo index=1
 - foo2 (bar, bar2) display=我 index=2

Macros: 
 - bar (Foo, foo2) foo
 - bar2 (foo2) foo=true
 - pipe (foo2) foo=true

Hello: Bar!
---
/**
  aaa
*/
// 123
aaa
[@Foo]bbbbar

|let foo = 1, bar = 2

@Foo (bar)[bar|bar]
(foo:bar)
foo[bar](bar foo)
  
// continue
[bar foo=foo bar="bar]foo" foo]
// end

|if bar > 0

barbarbar

|elseif bar == 2
// call elseif bar == 2

|elseif bar == 3
// call elseif bar == 3

|else
// call else

|end

// action

   @Foo (bar)[pipe foo=2]
   对话中的前导空格将被忽略
     
   测试

   
      action则例外

|let app = 1

> centered {{app}} <
> *centered* <
   *> centered <*

@foo2
> centered {{app}} <
>* centered *<
*> centered <*
// >app

// app

> App
> app2

test[[comment]]in*line**bold{{"template" | pipe}}con[label](pipe)tent***aft|pipe
test[[comment]]in*line**bold{{"template" | pipe}}con[label](pipe)tent**aft|pipe
test[[comment]]in*line**bold{{"template" | pipe}}con[label](pipe)tent*aft|pipe
test[[comment]]in*line**bold{{"template" | pipe}}con[label](pipe)tentaft|pipe
test[[comment]]in*line**bold{{"template" | pipe}}con[label](pipe)tentaft*|pipe

===

test[[comment]]in*line**bo_ld{{"template" | pipe}}con>0 [label](pipe) <te_nt***aft*|pipe
test[[comment]]in*line**bo*ld{{"template" | pipe}}con>1 [[label]](pipe) <tentaft*|pipe
test[[comment]]in*line**bo*ld{{"template" | pipe}}con>2 \[[label]](pipe) <tentaft*|pipe
test[[comment]]in*line**bo*ld{{"template" | pipe}}con>3 [\[label]](pipe) <tentaft*|pipe
test[[comment]]in*line**bo*ld{{"template" | pipe}}con>32 [\[label\]]() <tentaft*|pipe
test[[comment]]in*line**bo*ld{{"template" | pipe}}con>33[\[label](pipe foo=1) <tentaft*|pipe
test[[comment]]in*line**bo*ld{{"template" | pipe}}con>4 [\[label\]](pipe) <tentaft*|pipe
test[[comment]]in*line**bo*ld{{"tem}}plate" | pipe}}con>5 [\[label]]\(pipe) <tentaft*|pipe

