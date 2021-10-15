'use strict';const ohm=require('ohm-js');module.exports=ohm.makeRecipe(["grammar",{"source":"AVS {\r\n  Scripts\r\n    = LogicBlock*\r\n  LogicBlock\r\n    = Comment\r\n    | IF LogicBlock* (ELSEIF LogicBlock*)* (ELSE LogicBlock*)? END  -- IF\r\n    | WHILE LogicBlock* END  -- WHILE\r\n    | FOREACH LogicBlock* END  -- FOREACH\r\n    | LET                      -- LET\r\n    | StoryLine                       -- Story\r\n  Comment = \"//\" comment_single     -- single\r\n          | \"/*\" comment_multi \"*/\"       -- multi\r\n  comment_single = (~(\"\\n\" | \"\\r\") any)+\r\n  comment_multi = (~(\"*/\") any)+\r\n  StoryLine\r\n    = \"[\" command Content \"]\"    -- formatB\r\n      | \"@\" command Content (\"\\r\"|\";\"|\"\\n\"|end)?  -- formatA\r\n      | \"@\" command (\"\\r\"|\";\"|\"\\n\"|end)?  -- formatC\r\n      | \"[\" command \"]\"    -- formatD\r\n      | text? \"@{\" Identifier \"}\" text?  -- formatVar\r\n      | text -- formatE\r\n  text = (~(\"[\" | \"@\" | \"#\" | \"\\n\" | \"\\r\" | \"//\" | \"/*\") any)+\r\n\r\n  command = key\r\n\r\n  Content \r\n    = KeyValue (#\",\")? Content -- mul\r\n    | KeyValue                   -- base\r\n\r\n  KeyValue = # key \"=\" Exp  -- param\r\n    | key        -- flag\r\n  key = (letter | number | \"_\")+\r\n  value = string | number | boolean | \"null\"\r\n\r\n  ArraySpread = Exp \"...\" Exp\r\n\r\n  ArrayItems = ListOf<Exp, \",\">\r\n  Array = \"[\" ArrayItems \"]\"\r\n  \r\n  Expression = Array | Identifier | value\r\n\r\n  string = \"\\\"\" doubleQuoteStringContent* \"\\\"\" -- doubleQuote\r\n      | \"\\'\" singleQuoteStringContent* \"\\'\" -- singleQuote\r\n// ~(\"\\'\" | \"\\\\\" ) any  -- nonEscaped\r\n  singleQuoteStringContent = ~(\"\\'\") any  -- nonEscaped\r\n      | \"\\\\\" escapeCharacter                 -- escaped\r\n  doubleQuoteStringContent = ~(\"\\\"\") any  -- nonEscaped\r\n      | \"\\\\\" escapeCharacter                 -- escaped\r\n  singleEscapeCharacter = \"'\"|\"\\\"\"|\"\\\\\"|\"b\"|\"f\"|\"n\"|\"r\"|\"t\"|\"v\"\r\n  escapeCharacter = singleEscapeCharacter | \"x\" | \"u\"\r\n  quote = \"\\\"\" | \"\\'\"\r\n  boolean = \"true\" | \"false\"\r\n  number  (a number)\r\n    = (\"-\"|\"+\") number   -- sign\r\n    | digit* \".\" digit+  --  fract\r\n    | \"0x\" hexdigit+        --  hex\r\n    | digit+             --  whole\r\n  hexdigit\r\n    = \"a\"..\"f\" | \"A\"..\"F\" | digit\r\n  Identifier = ~(number | boolean) (\"$\" | \"%\")? key\r\n  invalidIdentifier(valid identifier) = ~(number | boolean) (\"$\" | \"%\")? (key \" \"+ key)\r\n  statment_end(请换行) = (\" \"|\";\")* (\"\\n\"|\"\\r\"|\"\\t\"|end)\r\n  IF\r\n    = \"#if\" Exp\r\n  LET\r\n    = \"#let\" ListOf<LetStatement, \",\"> #statment_end\r\n  LetStatement\r\n    = Identifier \"=\" Exp  -- assign\r\n    | Identifier         -- nonAssign\r\n  END\r\n    = \"#end\"\r\n  ELSE\r\n    = \"#else\"\r\n  ELSEIF\r\n    = \"#elseif\" Exp\r\n  WHILE\r\n    = \"#while\" Exp\r\n  FOREACH\r\n    = \"#foreach\" Identifier \"in\" ~(invalidIdentifier)(Identifier | Array | ArraySpread | ArrayItems)\r\n  Exp\r\n    = JudgeExp booleanOperator Exp  -- bool\r\n    | JudgeExp\r\n  booleanOperator = \"&&\" | \"||\"\r\n  JudgeExp\r\n    = AddExp judgeOperator AddExp     -- judge\r\n    | AddExp\r\n  judgeOperator = \"!=\" | \"==\" | \"??\" | \">=\" | \"<=\" | \">\" | \"<\"\r\n  // MathExp\r\n  // = MathExp mathOperator MathExp  -- math\r\n  // | PriExp\r\n  // mathOperator = \"+\" | \"-\" | \"*\" | \"/\" | \"^\" | \"%\"\r\n  AddExp\r\n  = AddExp (\"+\" | \"-\") MulExp  -- add\r\n  // | AddExp \"-\" MulExp  -- minus\r\n  | MulExp\r\n  MulExp\r\n    = MulExp (\"*\" | \"/\" | \"%\") ExpExp  -- mul\r\n    // | MulExp \"/\" ExpExp  -- divide\r\n    // | MulExp \"%\" ExpExp  -- mod\r\n    | ExpExp\r\n  ExpExp\r\n    = PriExp \"^\" ExpExp  -- power\r\n    | PriExp\r\n  PriExp\r\n  = \"(\" Exp \")\"  -- paren\r\n  | \"+\" PriExp   -- pos\r\n  | \"-\" PriExp   -- neg\r\n  | Expression\r\n}"},"AVS",null,"Scripts",{"Scripts":["define",{"sourceInterval":[9,35]},null,[],["star",{"sourceInterval":[24,35]},["app",{"sourceInterval":[24,34]},"LogicBlock",[]]]],"LogicBlock_IF":["define",{"sourceInterval":[72,139]},null,[],["seq",{"sourceInterval":[72,132]},["app",{"sourceInterval":[72,74]},"IF",[]],["star",{"sourceInterval":[75,86]},["app",{"sourceInterval":[75,85]},"LogicBlock",[]]],["star",{"sourceInterval":[87,108]},["seq",{"sourceInterval":[88,106]},["app",{"sourceInterval":[88,94]},"ELSEIF",[]],["star",{"sourceInterval":[95,106]},["app",{"sourceInterval":[95,105]},"LogicBlock",[]]]]],["opt",{"sourceInterval":[109,128]},["seq",{"sourceInterval":[110,126]},["app",{"sourceInterval":[110,114]},"ELSE",[]],["star",{"sourceInterval":[115,126]},["app",{"sourceInterval":[115,125]},"LogicBlock",[]]]]],["app",{"sourceInterval":[129,132]},"END",[]]]],"LogicBlock_WHILE":["define",{"sourceInterval":[147,178]},null,[],["seq",{"sourceInterval":[147,168]},["app",{"sourceInterval":[147,152]},"WHILE",[]],["star",{"sourceInterval":[153,164]},["app",{"sourceInterval":[153,163]},"LogicBlock",[]]],["app",{"sourceInterval":[165,168]},"END",[]]]],"LogicBlock_FOREACH":["define",{"sourceInterval":[186,221]},null,[],["seq",{"sourceInterval":[186,209]},["app",{"sourceInterval":[186,193]},"FOREACH",[]],["star",{"sourceInterval":[194,205]},["app",{"sourceInterval":[194,204]},"LogicBlock",[]]],["app",{"sourceInterval":[206,209]},"END",[]]]],"LogicBlock_LET":["define",{"sourceInterval":[229,260]},null,[],["app",{"sourceInterval":[229,232]},"LET",[]]],"LogicBlock_Story":["define",{"sourceInterval":[268,308]},null,[],["app",{"sourceInterval":[268,277]},"StoryLine",[]]],"LogicBlock":["define",{"sourceInterval":[39,308]},null,[],["alt",{"sourceInterval":[57,308]},["app",{"sourceInterval":[57,64]},"Comment",[]],["app",{"sourceInterval":[72,132]},"LogicBlock_IF",[]],["app",{"sourceInterval":[147,168]},"LogicBlock_WHILE",[]],["app",{"sourceInterval":[186,209]},"LogicBlock_FOREACH",[]],["app",{"sourceInterval":[229,232]},"LogicBlock_LET",[]],["app",{"sourceInterval":[268,277]},"LogicBlock_Story",[]]]],"Comment_single":["define",{"sourceInterval":[322,355]},null,[],["seq",{"sourceInterval":[322,341]},["terminal",{"sourceInterval":[322,326]},"//"],["app",{"sourceInterval":[327,341]},"comment_single",[]]]],"Comment_multi":["define",{"sourceInterval":[369,407]},null,[],["seq",{"sourceInterval":[369,392]},["terminal",{"sourceInterval":[369,373]},"/*"],["app",{"sourceInterval":[374,387]},"comment_multi",[]],["terminal",{"sourceInterval":[388,392]},"*/"]]],"Comment":["define",{"sourceInterval":[312,407]},null,[],["alt",{"sourceInterval":[322,407]},["app",{"sourceInterval":[322,341]},"Comment_single",[]],["app",{"sourceInterval":[369,392]},"Comment_multi",[]]]],"comment_single":["define",{"sourceInterval":[411,449]},null,[],["plus",{"sourceInterval":[428,449]},["seq",{"sourceInterval":[429,447]},["not",{"sourceInterval":[429,443]},["alt",{"sourceInterval":[431,442]},["terminal",{"sourceInterval":[431,435]},"\n"],["terminal",{"sourceInterval":[438,442]},"\r"]]],["app",{"sourceInterval":[444,447]},"any",[]]]]],"comment_multi":["define",{"sourceInterval":[453,483]},null,[],["plus",{"sourceInterval":[469,483]},["seq",{"sourceInterval":[470,481]},["not",{"sourceInterval":[470,477]},["terminal",{"sourceInterval":[472,476]},"*/"]],["app",{"sourceInterval":[478,481]},"any",[]]]]],"StoryLine_formatB":["define",{"sourceInterval":[504,541]},null,[],["seq",{"sourceInterval":[504,527]},["terminal",{"sourceInterval":[504,507]},"["],["app",{"sourceInterval":[508,515]},"command",[]],["app",{"sourceInterval":[516,523]},"Content",[]],["terminal",{"sourceInterval":[524,527]},"]"]]],"StoryLine_formatA":["define",{"sourceInterval":[551,603]},null,[],["seq",{"sourceInterval":[551,591]},["terminal",{"sourceInterval":[551,554]},"@"],["app",{"sourceInterval":[555,562]},"command",[]],["app",{"sourceInterval":[563,570]},"Content",[]],["opt",{"sourceInterval":[571,591]},["alt",{"sourceInterval":[572,589]},["terminal",{"sourceInterval":[572,576]},"\r"],["terminal",{"sourceInterval":[577,580]},";"],["terminal",{"sourceInterval":[581,585]},"\n"],["app",{"sourceInterval":[586,589]},"end",[]]]]]],"StoryLine_formatC":["define",{"sourceInterval":[613,657]},null,[],["seq",{"sourceInterval":[613,645]},["terminal",{"sourceInterval":[613,616]},"@"],["app",{"sourceInterval":[617,624]},"command",[]],["opt",{"sourceInterval":[625,645]},["alt",{"sourceInterval":[626,643]},["terminal",{"sourceInterval":[626,630]},"\r"],["terminal",{"sourceInterval":[631,634]},";"],["terminal",{"sourceInterval":[635,639]},"\n"],["app",{"sourceInterval":[640,643]},"end",[]]]]]],"StoryLine_formatD":["define",{"sourceInterval":[667,696]},null,[],["seq",{"sourceInterval":[667,682]},["terminal",{"sourceInterval":[667,670]},"["],["app",{"sourceInterval":[671,678]},"command",[]],["terminal",{"sourceInterval":[679,682]},"]"]]],"StoryLine_formatVar":["define",{"sourceInterval":[706,751]},null,[],["seq",{"sourceInterval":[706,737]},["opt",{"sourceInterval":[706,711]},["app",{"sourceInterval":[706,710]},"text",[]]],["terminal",{"sourceInterval":[712,716]},"@{"],["app",{"sourceInterval":[717,727]},"Identifier",[]],["terminal",{"sourceInterval":[728,731]},"}"],["opt",{"sourceInterval":[732,737]},["app",{"sourceInterval":[732,736]},"text",[]]]]],"StoryLine_formatE":["define",{"sourceInterval":[761,776]},null,[],["app",{"sourceInterval":[761,765]},"text",[]]],"StoryLine":["define",{"sourceInterval":[487,776]},null,[],["alt",{"sourceInterval":[504,776]},["app",{"sourceInterval":[504,527]},"StoryLine_formatB",[]],["app",{"sourceInterval":[551,591]},"StoryLine_formatA",[]],["app",{"sourceInterval":[613,645]},"StoryLine_formatC",[]],["app",{"sourceInterval":[667,682]},"StoryLine_formatD",[]],["app",{"sourceInterval":[706,737]},"StoryLine_formatVar",[]],["app",{"sourceInterval":[761,765]},"StoryLine_formatE",[]]]],"text":["define",{"sourceInterval":[780,840]},null,[],["plus",{"sourceInterval":[787,840]},["seq",{"sourceInterval":[788,838]},["not",{"sourceInterval":[788,834]},["alt",{"sourceInterval":[790,833]},["terminal",{"sourceInterval":[790,793]},"["],["terminal",{"sourceInterval":[796,799]},"@"],["terminal",{"sourceInterval":[802,805]},"#"],["terminal",{"sourceInterval":[808,812]},"\n"],["terminal",{"sourceInterval":[815,819]},"\r"],["terminal",{"sourceInterval":[822,826]},"//"],["terminal",{"sourceInterval":[829,833]},"/*"]]],["app",{"sourceInterval":[835,838]},"any",[]]]]],"command":["define",{"sourceInterval":[846,859]},null,[],["app",{"sourceInterval":[856,859]},"key",[]]],"Content_mul":["define",{"sourceInterval":[881,912]},null,[],["seq",{"sourceInterval":[881,905]},["app",{"sourceInterval":[881,889]},"KeyValue",[]],["opt",{"sourceInterval":[890,897]},["lex",{"sourceInterval":[891,895]},["terminal",{"sourceInterval":[892,895]},","]]],["app",{"sourceInterval":[898,905]},"Content",[]]]],"Content_base":["define",{"sourceInterval":[920,954]},null,[],["app",{"sourceInterval":[920,928]},"KeyValue",[]]],"Content":["define",{"sourceInterval":[865,954]},null,[],["alt",{"sourceInterval":[881,954]},["app",{"sourceInterval":[881,905]},"Content_mul",[]],["app",{"sourceInterval":[920,928]},"Content_base",[]]]],"KeyValue_param":["define",{"sourceInterval":[971,994]},null,[],["seq",{"sourceInterval":[971,984]},["lex",{"sourceInterval":[971,976]},["app",{"sourceInterval":[973,976]},"key",[]]],["terminal",{"sourceInterval":[977,980]},"="],["app",{"sourceInterval":[981,984]},"Exp",[]]]],"KeyValue_flag":["define",{"sourceInterval":[1002,1020]},null,[],["app",{"sourceInterval":[1002,1005]},"key",[]]],"KeyValue":["define",{"sourceInterval":[960,1020]},null,[],["alt",{"sourceInterval":[971,1020]},["app",{"sourceInterval":[971,984]},"KeyValue_param",[]],["app",{"sourceInterval":[1002,1005]},"KeyValue_flag",[]]]],"key":["define",{"sourceInterval":[1024,1054]},null,[],["plus",{"sourceInterval":[1030,1054]},["alt",{"sourceInterval":[1031,1052]},["app",{"sourceInterval":[1031,1037]},"letter",[]],["app",{"sourceInterval":[1040,1046]},"number",[]],["terminal",{"sourceInterval":[1049,1052]},"_"]]]],"value":["define",{"sourceInterval":[1058,1100]},null,[],["alt",{"sourceInterval":[1066,1100]},["app",{"sourceInterval":[1066,1072]},"string",[]],["app",{"sourceInterval":[1075,1081]},"number",[]],["app",{"sourceInterval":[1084,1091]},"boolean",[]],["terminal",{"sourceInterval":[1094,1100]},"null"]]],"ArraySpread":["define",{"sourceInterval":[1106,1133]},null,[],["seq",{"sourceInterval":[1120,1133]},["app",{"sourceInterval":[1120,1123]},"Exp",[]],["terminal",{"sourceInterval":[1124,1129]},"..."],["app",{"sourceInterval":[1130,1133]},"Exp",[]]]],"ArrayItems":["define",{"sourceInterval":[1139,1168]},null,[],["app",{"sourceInterval":[1152,1168]},"ListOf",[["app",{"sourceInterval":[1159,1162]},"Exp",[]],["terminal",{"sourceInterval":[1164,1167]},","]]]],"Array":["define",{"sourceInterval":[1172,1198]},null,[],["seq",{"sourceInterval":[1180,1198]},["terminal",{"sourceInterval":[1180,1183]},"["],["app",{"sourceInterval":[1184,1194]},"ArrayItems",[]],["terminal",{"sourceInterval":[1195,1198]},"]"]]],"Expression":["define",{"sourceInterval":[1206,1245]},null,[],["alt",{"sourceInterval":[1219,1245]},["app",{"sourceInterval":[1219,1224]},"Array",[]],["app",{"sourceInterval":[1227,1237]},"Identifier",[]],["app",{"sourceInterval":[1240,1245]},"value",[]]]],"string_doubleQuote":["define",{"sourceInterval":[1260,1310]},null,[],["seq",{"sourceInterval":[1260,1295]},["terminal",{"sourceInterval":[1260,1264]},"\""],["star",{"sourceInterval":[1265,1290]},["app",{"sourceInterval":[1265,1289]},"doubleQuoteStringContent",[]]],["terminal",{"sourceInterval":[1291,1295]},"\""]]],"string_singleQuote":["define",{"sourceInterval":[1320,1370]},null,[],["seq",{"sourceInterval":[1320,1355]},["terminal",{"sourceInterval":[1320,1324]},"'"],["star",{"sourceInterval":[1325,1350]},["app",{"sourceInterval":[1325,1349]},"singleQuoteStringContent",[]]],["terminal",{"sourceInterval":[1351,1355]},"'"]]],"string":["define",{"sourceInterval":[1251,1370]},null,[],["alt",{"sourceInterval":[1260,1370]},["app",{"sourceInterval":[1260,1295]},"string_doubleQuote",[]],["app",{"sourceInterval":[1320,1355]},"string_singleQuote",[]]]],"singleQuoteStringContent_nonEscaped":["define",{"sourceInterval":[1440,1466]},null,[],["seq",{"sourceInterval":[1440,1451]},["not",{"sourceInterval":[1440,1447]},["terminal",{"sourceInterval":[1442,1446]},"'"]],["app",{"sourceInterval":[1448,1451]},"any",[]]]],"singleQuoteStringContent_escaped":["define",{"sourceInterval":[1476,1523]},null,[],["seq",{"sourceInterval":[1476,1496]},["terminal",{"sourceInterval":[1476,1480]},"\\"],["app",{"sourceInterval":[1481,1496]},"escapeCharacter",[]]]],"singleQuoteStringContent":["define",{"sourceInterval":[1413,1523]},null,[],["alt",{"sourceInterval":[1440,1523]},["app",{"sourceInterval":[1440,1451]},"singleQuoteStringContent_nonEscaped",[]],["app",{"sourceInterval":[1476,1496]},"singleQuoteStringContent_escaped",[]]]],"doubleQuoteStringContent_nonEscaped":["define",{"sourceInterval":[1554,1580]},null,[],["seq",{"sourceInterval":[1554,1565]},["not",{"sourceInterval":[1554,1561]},["terminal",{"sourceInterval":[1556,1560]},"\""]],["app",{"sourceInterval":[1562,1565]},"any",[]]]],"doubleQuoteStringContent_escaped":["define",{"sourceInterval":[1590,1637]},null,[],["seq",{"sourceInterval":[1590,1610]},["terminal",{"sourceInterval":[1590,1594]},"\\"],["app",{"sourceInterval":[1595,1610]},"escapeCharacter",[]]]],"doubleQuoteStringContent":["define",{"sourceInterval":[1527,1637]},null,[],["alt",{"sourceInterval":[1554,1637]},["app",{"sourceInterval":[1554,1565]},"doubleQuoteStringContent_nonEscaped",[]],["app",{"sourceInterval":[1590,1610]},"doubleQuoteStringContent_escaped",[]]]],"singleEscapeCharacter":["define",{"sourceInterval":[1641,1702]},null,[],["alt",{"sourceInterval":[1665,1702]},["terminal",{"sourceInterval":[1665,1668]},"'"],["terminal",{"sourceInterval":[1669,1673]},"\""],["terminal",{"sourceInterval":[1674,1678]},"\\"],["terminal",{"sourceInterval":[1679,1682]},"b"],["terminal",{"sourceInterval":[1683,1686]},"f"],["terminal",{"sourceInterval":[1687,1690]},"n"],["terminal",{"sourceInterval":[1691,1694]},"r"],["terminal",{"sourceInterval":[1695,1698]},"t"],["terminal",{"sourceInterval":[1699,1702]},"v"]]],"escapeCharacter":["define",{"sourceInterval":[1706,1757]},null,[],["alt",{"sourceInterval":[1724,1757]},["app",{"sourceInterval":[1724,1745]},"singleEscapeCharacter",[]],["terminal",{"sourceInterval":[1748,1751]},"x"],["terminal",{"sourceInterval":[1754,1757]},"u"]]],"quote":["define",{"sourceInterval":[1761,1780]},null,[],["alt",{"sourceInterval":[1769,1780]},["terminal",{"sourceInterval":[1769,1773]},"\""],["terminal",{"sourceInterval":[1776,1780]},"'"]]],"boolean":["define",{"sourceInterval":[1784,1810]},null,[],["alt",{"sourceInterval":[1794,1810]},["terminal",{"sourceInterval":[1794,1800]},"true"],["terminal",{"sourceInterval":[1803,1810]},"false"]]],"number_sign":["define",{"sourceInterval":[1840,1866]},null,[],["seq",{"sourceInterval":[1840,1856]},["alt",{"sourceInterval":[1841,1848]},["terminal",{"sourceInterval":[1841,1844]},"-"],["terminal",{"sourceInterval":[1845,1848]},"+"]],["app",{"sourceInterval":[1850,1856]},"number",[]]]],"number_fract":["define",{"sourceInterval":[1874,1902]},null,[],["seq",{"sourceInterval":[1874,1891]},["star",{"sourceInterval":[1874,1880]},["app",{"sourceInterval":[1874,1879]},"digit",[]]],["terminal",{"sourceInterval":[1881,1884]},"."],["plus",{"sourceInterval":[1885,1891]},["app",{"sourceInterval":[1885,1890]},"digit",[]]]]],"number_hex":["define",{"sourceInterval":[1910,1939]},null,[],["seq",{"sourceInterval":[1910,1924]},["terminal",{"sourceInterval":[1910,1914]},"0x"],["plus",{"sourceInterval":[1915,1924]},["app",{"sourceInterval":[1915,1923]},"hexdigit",[]]]]],"number_whole":["define",{"sourceInterval":[1947,1975]},null,[],["plus",{"sourceInterval":[1947,1953]},["app",{"sourceInterval":[1947,1952]},"digit",[]]]],"number":["define",{"sourceInterval":[1814,1975]},"a number",[],["alt",{"sourceInterval":[1840,1975]},["app",{"sourceInterval":[1840,1856]},"number_sign",[]],["app",{"sourceInterval":[1874,1891]},"number_fract",[]],["app",{"sourceInterval":[1910,1924]},"number_hex",[]],["app",{"sourceInterval":[1947,1953]},"number_whole",[]]]],"hexdigit":["define",{"sourceInterval":[1979,2022]},null,[],["alt",{"sourceInterval":[1995,2022]},["range",{"sourceInterval":[1995,2003]},"a","f"],["range",{"sourceInterval":[2006,2014]},"A","F"],["app",{"sourceInterval":[2017,2022]},"digit",[]]]],"Identifier":["define",{"sourceInterval":[2026,2075]},null,[],["seq",{"sourceInterval":[2039,2075]},["not",{"sourceInterval":[2039,2058]},["alt",{"sourceInterval":[2041,2057]},["app",{"sourceInterval":[2041,2047]},"number",[]],["app",{"sourceInterval":[2050,2057]},"boolean",[]]]],["opt",{"sourceInterval":[2059,2071]},["alt",{"sourceInterval":[2060,2069]},["terminal",{"sourceInterval":[2060,2063]},"$"],["terminal",{"sourceInterval":[2066,2069]},"%"]]],["app",{"sourceInterval":[2072,2075]},"key",[]]]],"invalidIdentifier":["define",{"sourceInterval":[2079,2164]},"valid identifier",[],["seq",{"sourceInterval":[2117,2164]},["not",{"sourceInterval":[2117,2136]},["alt",{"sourceInterval":[2119,2135]},["app",{"sourceInterval":[2119,2125]},"number",[]],["app",{"sourceInterval":[2128,2135]},"boolean",[]]]],["opt",{"sourceInterval":[2137,2149]},["alt",{"sourceInterval":[2138,2147]},["terminal",{"sourceInterval":[2138,2141]},"$"],["terminal",{"sourceInterval":[2144,2147]},"%"]]],["app",{"sourceInterval":[2151,2154]},"key",[]],["plus",{"sourceInterval":[2155,2159]},["terminal",{"sourceInterval":[2155,2158]}," "]],["app",{"sourceInterval":[2160,2163]},"key",[]]]],"statment_end":["define",{"sourceInterval":[2168,2219]},"请换行",[],["seq",{"sourceInterval":[2188,2219]},["star",{"sourceInterval":[2188,2198]},["alt",{"sourceInterval":[2189,2196]},["terminal",{"sourceInterval":[2189,2192]}," "],["terminal",{"sourceInterval":[2193,2196]},";"]]],["alt",{"sourceInterval":[2200,2218]},["terminal",{"sourceInterval":[2200,2204]},"\n"],["terminal",{"sourceInterval":[2205,2209]},"\r"],["terminal",{"sourceInterval":[2210,2214]},"\t"],["app",{"sourceInterval":[2215,2218]},"end",[]]]]],"IF":["define",{"sourceInterval":[2223,2242]},null,[],["seq",{"sourceInterval":[2233,2242]},["terminal",{"sourceInterval":[2233,2238]},"#if"],["app",{"sourceInterval":[2239,2242]},"Exp",[]]]],"LET":["define",{"sourceInterval":[2246,2303]},null,[],["seq",{"sourceInterval":[2257,2303]},["terminal",{"sourceInterval":[2257,2263]},"#let"],["app",{"sourceInterval":[2264,2289]},"ListOf",[["app",{"sourceInterval":[2271,2283]},"LetStatement",[]],["terminal",{"sourceInterval":[2285,2288]},","]]],["lex",{"sourceInterval":[2290,2303]},["app",{"sourceInterval":[2291,2303]},"statment_end",[]]]]],"LetStatement_assign":["define",{"sourceInterval":[2327,2356]},null,[],["seq",{"sourceInterval":[2327,2345]},["app",{"sourceInterval":[2327,2337]},"Identifier",[]],["terminal",{"sourceInterval":[2338,2341]},"="],["app",{"sourceInterval":[2342,2345]},"Exp",[]]]],"LetStatement_nonAssign":["define",{"sourceInterval":[2364,2395]},null,[],["app",{"sourceInterval":[2364,2374]},"Identifier",[]]],"LetStatement":["define",{"sourceInterval":[2307,2395]},null,[],["alt",{"sourceInterval":[2327,2395]},["app",{"sourceInterval":[2327,2345]},"LetStatement_assign",[]],["app",{"sourceInterval":[2364,2374]},"LetStatement_nonAssign",[]]]],"END":["define",{"sourceInterval":[2399,2416]},null,[],["terminal",{"sourceInterval":[2410,2416]},"#end"]],"ELSE":["define",{"sourceInterval":[2420,2439]},null,[],["terminal",{"sourceInterval":[2432,2439]},"#else"]],"ELSEIF":["define",{"sourceInterval":[2443,2470]},null,[],["seq",{"sourceInterval":[2457,2470]},["terminal",{"sourceInterval":[2457,2466]},"#elseif"],["app",{"sourceInterval":[2467,2470]},"Exp",[]]]],"WHILE":["define",{"sourceInterval":[2474,2499]},null,[],["seq",{"sourceInterval":[2487,2499]},["terminal",{"sourceInterval":[2487,2495]},"#while"],["app",{"sourceInterval":[2496,2499]},"Exp",[]]]],"FOREACH":["define",{"sourceInterval":[2503,2612]},null,[],["seq",{"sourceInterval":[2518,2612]},["terminal",{"sourceInterval":[2518,2528]},"#foreach"],["app",{"sourceInterval":[2529,2539]},"Identifier",[]],["terminal",{"sourceInterval":[2540,2544]},"in"],["not",{"sourceInterval":[2545,2565]},["app",{"sourceInterval":[2547,2564]},"invalidIdentifier",[]]],["alt",{"sourceInterval":[2566,2611]},["app",{"sourceInterval":[2566,2576]},"Identifier",[]],["app",{"sourceInterval":[2579,2584]},"Array",[]],["app",{"sourceInterval":[2587,2598]},"ArraySpread",[]],["app",{"sourceInterval":[2601,2611]},"ArrayItems",[]]]]],"Exp_bool":["define",{"sourceInterval":[2627,2664]},null,[],["seq",{"sourceInterval":[2627,2655]},["app",{"sourceInterval":[2627,2635]},"JudgeExp",[]],["app",{"sourceInterval":[2636,2651]},"booleanOperator",[]],["app",{"sourceInterval":[2652,2655]},"Exp",[]]]],"Exp":["define",{"sourceInterval":[2616,2680]},null,[],["alt",{"sourceInterval":[2627,2680]},["app",{"sourceInterval":[2627,2655]},"Exp_bool",[]],["app",{"sourceInterval":[2672,2680]},"JudgeExp",[]]]],"booleanOperator":["define",{"sourceInterval":[2684,2713]},null,[],["alt",{"sourceInterval":[2702,2713]},["terminal",{"sourceInterval":[2702,2706]},"&&"],["terminal",{"sourceInterval":[2709,2713]},"||"]]],"JudgeExp_judge":["define",{"sourceInterval":[2733,2773]},null,[],["seq",{"sourceInterval":[2733,2760]},["app",{"sourceInterval":[2733,2739]},"AddExp",[]],["app",{"sourceInterval":[2740,2753]},"judgeOperator",[]],["app",{"sourceInterval":[2754,2760]},"AddExp",[]]]],"JudgeExp":["define",{"sourceInterval":[2717,2787]},null,[],["alt",{"sourceInterval":[2733,2787]},["app",{"sourceInterval":[2733,2760]},"JudgeExp_judge",[]],["app",{"sourceInterval":[2781,2787]},"AddExp",[]]]],"judgeOperator":["define",{"sourceInterval":[2791,2851]},null,[],["alt",{"sourceInterval":[2807,2851]},["terminal",{"sourceInterval":[2807,2811]},"!="],["terminal",{"sourceInterval":[2814,2818]},"=="],["terminal",{"sourceInterval":[2821,2825]},"??"],["terminal",{"sourceInterval":[2828,2832]},">="],["terminal",{"sourceInterval":[2835,2839]},"<="],["terminal",{"sourceInterval":[2842,2845]},">"],["terminal",{"sourceInterval":[2848,2851]},"<"]]],"AddExp_add":["define",{"sourceInterval":[2997,3030]},null,[],["seq",{"sourceInterval":[2997,3022]},["app",{"sourceInterval":[2997,3003]},"AddExp",[]],["alt",{"sourceInterval":[3005,3014]},["terminal",{"sourceInterval":[3005,3008]},"+"],["terminal",{"sourceInterval":[3011,3014]},"-"]],["app",{"sourceInterval":[3016,3022]},"MulExp",[]]]],"AddExp":["define",{"sourceInterval":[2985,3078]},null,[],["alt",{"sourceInterval":[2997,3078]},["app",{"sourceInterval":[2997,3022]},"AddExp_add",[]],["app",{"sourceInterval":[3072,3078]},"MulExp",[]]]],"MulExp_mul":["define",{"sourceInterval":[3096,3135]},null,[],["seq",{"sourceInterval":[3096,3127]},["app",{"sourceInterval":[3096,3102]},"MulExp",[]],["alt",{"sourceInterval":[3104,3119]},["terminal",{"sourceInterval":[3104,3107]},"*"],["terminal",{"sourceInterval":[3110,3113]},"/"],["terminal",{"sourceInterval":[3116,3119]},"%"]],["app",{"sourceInterval":[3121,3127]},"ExpExp",[]]]],"MulExp":["define",{"sourceInterval":[3082,3224]},null,[],["alt",{"sourceInterval":[3096,3224]},["app",{"sourceInterval":[3096,3127]},"MulExp_mul",[]],["app",{"sourceInterval":[3218,3224]},"ExpExp",[]]]],"ExpExp_power":["define",{"sourceInterval":[3242,3269]},null,[],["seq",{"sourceInterval":[3242,3259]},["app",{"sourceInterval":[3242,3248]},"PriExp",[]],["terminal",{"sourceInterval":[3249,3252]},"^"],["app",{"sourceInterval":[3253,3259]},"ExpExp",[]]]],"ExpExp":["define",{"sourceInterval":[3228,3283]},null,[],["alt",{"sourceInterval":[3242,3283]},["app",{"sourceInterval":[3242,3259]},"ExpExp_power",[]],["app",{"sourceInterval":[3277,3283]},"PriExp",[]]]],"PriExp_paren":["define",{"sourceInterval":[3299,3320]},null,[],["seq",{"sourceInterval":[3299,3310]},["terminal",{"sourceInterval":[3299,3302]},"("],["app",{"sourceInterval":[3303,3306]},"Exp",[]],["terminal",{"sourceInterval":[3307,3310]},")"]]],"PriExp_pos":["define",{"sourceInterval":[3326,3345]},null,[],["seq",{"sourceInterval":[3326,3336]},["terminal",{"sourceInterval":[3326,3329]},"+"],["app",{"sourceInterval":[3330,3336]},"PriExp",[]]]],"PriExp_neg":["define",{"sourceInterval":[3351,3370]},null,[],["seq",{"sourceInterval":[3351,3361]},["terminal",{"sourceInterval":[3351,3354]},"-"],["app",{"sourceInterval":[3355,3361]},"PriExp",[]]]],"PriExp":["define",{"sourceInterval":[3287,3386]},null,[],["alt",{"sourceInterval":[3299,3386]},["app",{"sourceInterval":[3299,3310]},"PriExp_paren",[]],["app",{"sourceInterval":[3326,3336]},"PriExp_pos",[]],["app",{"sourceInterval":[3351,3361]},"PriExp_neg",[]],["app",{"sourceInterval":[3376,3386]},"Expression",[]]]]}]);
