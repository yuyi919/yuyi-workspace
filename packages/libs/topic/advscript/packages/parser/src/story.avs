/**
 * 测试
 * @param a
 */
|let foo = false
|let $foo = "246"
|let %foo = ((246+20) * 2 - 20*1-2) * 20

运算结果：{{%foo | app}}


|let foo = (246 + 234) / 123 * 123
|let bar = 123, $length = 3, $ass
赋值：bar={{%foo}}, $length={{$length}}

|let $ass = [0, 1, 2, 3]
|let foobar = [123, false, true]
|if foo - 1 < bar * 2
  永远不展示

|end

遍历1~{{$length}}测试

// |foreach i in 1...$length
//   [test c=(-1 * i) + 2 file="4s"+i]
// |end

// 遍历片段

// |foreach i in "你",     "我", "大家"
//   {{i}}好

// |end

// 大家好才是真的好
// 遍历数组foobar

// |foreach i in foobar
//   |if i > 0 || i == "s"
//     [test test file=i * 3 + 1 a=i]

//   |elseif i == false
//     [test a=i file="www:"+i]

//   |end
// |end

结束

123
// A123B

[[测试 Note]]
# 角色演出块
=简要介绍角色块的语法

@Yukari (喜悦)[喜び|position([0, "\]", .5, 50%])]
对[[测试]]话[测试.com](http://www.baidu.com)内容这是谁|お話
正常|お話2
正常[测试.com](app a=1 | app)|お話3

> 转场描述 //[转场名]

>123<

[ceshi arg="123" flag=test() | test]

123{{ 123 | pipe }}

//[ccc]

aaa|as12

