App: app
Characters:
 - app (bar) a='1' b=2
Macros:
 - app (app) aa='1' bb=2
---
   as
     as

@app (bar)
a|app aa b
[app aa ]

|if bar > 0
   ass

  |let bar, bar=2
  // |let bar, bar=2, bar3=bar
  |if bar == 1
    a
     as

  |elseif bar == 2
    a

  |else
    a

  |end
|end
