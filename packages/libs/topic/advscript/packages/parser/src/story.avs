/**
 * 测试
 * @param a
 */
#let foo = false
#let $foo = "246";
#let %foo = ((246+20) * 2 - 20*1-2) * 20
运算结果：@{%foo}
#let foo = (246 + 234) / 123 * 123
#let bar = 123, $length = 3, $ass
#let $ass = [0, 1, 2, 3]
#let foobar = [
  123,
  false,
  true
]
#if foo - 1 < bar * 2
  永远不展示
#end
遍历1~@{$length}测试
#foreach i in 1...$length
  [test c=(-1 * i) + 2 file="4s"+i]
#end
遍历片段
#foreach i in "你",     "我", "大家"
  @{i}好
#end
大家好才是真的好
遍历数组foobar
#foreach i in foobar
  #if i > 0 || i == "s"
    @test file=i * 3 + 1 a=i
  #elseif i == false
    [test a=i file="www:"+i]
  #end
#end
结束
