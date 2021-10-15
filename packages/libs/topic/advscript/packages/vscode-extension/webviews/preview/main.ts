/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-cond-assign */
/* eslint-disable prefer-rest-params */
import { FontDetect } from "./FontDetect";

let scrollTo: any, linehighlight_activeheight: number, userscroll: boolean;

console.log("initialized fountainview");

//lodash throttle
const FUNC_ERROR_TEXT = "Expected a function",
  NAN = NaN,
  symbolTag = "[object Symbol]",
  reTrim = /^\s+|\s+$/g,
  reIsBadHex = /^[-+]0x[0-9a-f]+$/i,
  reIsBinary = /^0b[01]+$/i,
  reIsOctal = /^0o[0-7]+$/i,
  freeParseInt = parseInt,
  freeGlobal = "object" == typeof global && global && global.Object === Object && global,
  freeSelf = "object" == typeof self && self && self.Object === Object && self,
  root = freeGlobal || freeSelf || Function("return this")(),
  objectProto = Object.prototype,
  objectToString = objectProto.toString,
  nativeMax = Math.max,
  nativeMin = Math.min,
  now = function () {
    return root.Date.now();
  };
function debounce(t, e, n) {
  let r,
    i,
    o,
    a,
    f,
    u,
    c = 0,
    l = !1,
    b = !1,
    s = !0;
  if ("function" != typeof t) throw new TypeError(FUNC_ERROR_TEXT);
  function v(e) {
    const n = r,
      o = i;
    return (r = i = void 0), (c = e), (a = t.apply(o, n));
  }
  function m(t) {
    const n = t - u;
    return void 0 === u || n >= e || n < 0 || (b && t - c >= o);
  }
  function y() {
    const t = now();
    if (m(t)) return j(t);
    f = setTimeout(
      y,
      (function (t) {
        const n = e - (t - u);
        return b ? nativeMin(n, o - (t - c)) : n;
      })(t)
    );
  }
  function j(t) {
    return (f = void 0), s && r ? v(t) : ((r = i = void 0), a);
  }
  function g() {
    const t = now(),
      n = m(t);
    if (((r = arguments), (i = this), (u = t), n)) {
      if (void 0 === f)
        return (function (t) {
          return (c = t), (f = setTimeout(y, e)), l ? v(t) : a;
        })(u);
      if (b) return (f = setTimeout(y, e)), v(u);
    }
    return void 0 === f && (f = setTimeout(y, e)), a;
  }
  return (
    (e = toNumber(e) || 0),
    isObject(n) &&
      ((l = !!n.leading),
      (o = (b = "maxWait" in n) ? nativeMax(toNumber(n.maxWait) || 0, e) : o),
      (s = "trailing" in n ? !!n.trailing : s)),
    (g.cancel = function () {
      void 0 !== f && clearTimeout(f), (c = 0), (r = u = i = f = void 0);
    }),
    (g.flush = function () {
      return void 0 === f ? a : j(now());
    }),
    g
  );
}
function throttle(t, e, n?) {
  let r = !0,
    i = !0;
  if ("function" != typeof t) throw new TypeError(FUNC_ERROR_TEXT);
  return (
    isObject(n) &&
      ((r = "leading" in n ? !!n.leading : r), (i = "trailing" in n ? !!n.trailing : i)),
    debounce(t, e, { leading: r, maxWait: e, trailing: i })
  );
}
function isObject(t) {
  const e = typeof t;
  return !!t && ("object" == e || "function" == e);
}
function isObjectLike(t) {
  return !!t && "object" == typeof t;
}
function isSymbol(t) {
  return "symbol" == typeof t || (isObjectLike(t) && objectToString.call(t) == symbolTag);
}
function toNumber(t) {
  if ("number" == typeof t) return t;
  if (isSymbol(t)) return NAN;
  if (isObject(t)) {
    const e = "function" == typeof t.valueOf ? t.valueOf() : t;
    t = isObject(e) ? e + "" : e;
  }
  if ("string" != typeof t) return 0 === t ? t : +t;
  t = t.replace(reTrim, "");
  const n = reIsBinary.test(t);
  return n || reIsOctal.test(t)
    ? freeParseInt(t.slice(2), n ? 2 : 8)
    : reIsBadHex.test(t)
    ? NAN
    : +t;
}

//@ts-ignore
const vscode = acquireVsCodeApi();

let codeLineElements = [];
function getCodeLineElements(): any[] | undefined {
  if (codeLineElements.length > 0) return codeLineElements;
  else {
    for (const element of document.getElementsByClassName("haseditorline")) {
      const id = element.getAttribute("id");
      if (id == null) continue;
      const line = Number(id.replace("sourceline_", ""));
      if (isNaN(line)) {
        continue;
      }
      codeLineElements.push(line);
    }
  }
}

function getElement(number) {
  return document.getElementById("sourceline_" + number);
}

function getLineElementsAtPageOffset(offset) {
  const lines = getCodeLineElements();
  if (!lines) return;
  const position = offset - window.scrollY;
  const lineswithzerotop = 0;
  let lo = -1;
  let hi = lines.length - 1;
  while (lo + 1 < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const bounds = getElement(lines[mid]).getBoundingClientRect();
    if (bounds.top + bounds.height >= position) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  const hiElement = lines[hi];
  const hiBounds = getElement(hiElement).getBoundingClientRect();
  if (hi >= 1 && hiBounds.top > position) {
    const loElement = lines[lo];
    return { previous: loElement, next: hiElement };
  }
  if (hi > 1 && hi < lines.length && hiBounds.top + hiBounds.height > position) {
    return {
      previous: hiElement,
      next: lines[hi + 1],
      exact: true,
    };
  }
  return {
    previous: hiElement,
  };
}

function getEditorLineNumberForPageOffset(offset) {
  const { previous, next } = getLineElementsAtPageOffset(offset);
  console.log(previous);
  if (document.getElementById("titlepage").getBoundingClientRect().bottom > 0) return 0;
  if (previous != undefined) {
    const previousBounds = getElement(previous).getBoundingClientRect();
    const offsetFromPrevious = offset - window.scrollY - previousBounds.top;
    if (next) {
      let progressBetweenElements =
        offsetFromPrevious / (getElement(next).getBoundingClientRect().top - previousBounds.top);
      if (progressBetweenElements == Infinity) progressBetweenElements = 0;
      const line = previous + progressBetweenElements * (next - previous);
      return line;
    } else {
      const progressWithinElement = offsetFromPrevious / previousBounds.height;
      const line = previous + progressWithinElement;
      return line;
    }
  }
  return null;
}

let state = {
  title_html: "",
  screenplay_html: "",
  docuri: "",
  dynamic: false,
  offset: 0,
};
const previousState = vscode.getState();
if (previousState != undefined) {
  state = previousState;
  applyHtml();
  window.scrollTo(0, state.offset);
}

window.addEventListener("message", (event) => {
  if (event.data.command == "updateScript") {
    state.screenplay_html = event.data.content;
    applyHtml();
  } else if (event.data.command == "updateTitle") {
    state.title_html = event.data.content;
    applyHtml();
  } else if (event.data.command == "updateFont") {
    const pages = document.getElementsByClassName("page") as HTMLCollection & HTMLDivElement[];
    for (const index in pages) {
      if (pages[index].style) {
        pages[index].style.fontFamily = event.data.content;
      }
    }
    vscode.postMessage({
      command: "updateFontResult",
      content: FontDetect.isFontLoaded(event.data.content),
      uri: state.docuri,
    });
  } else if (event.data.command == "removeFont") {
    const pages = document.getElementsByClassName("page") as HTMLCollection & HTMLDivElement[];
    for (const index in pages) {
      pages[index].style.fontFamily = "";
    }
  } else if (event.data.command == "updateconfig") {
    fountainconfig = event.data.content;
    applyConfig();
  } else if (event.data.command == "showsourceline") {
    scrollToRevealSourceLine(event.data.content, event.data.linescount, event.data.source);
  } else if (event.data.command == "setstate") {
    if (event.data.uri !== undefined) state.docuri = event.data.uri;
    if (event.data.dynamic !== undefined) state.dynamic = event.data.dynamic;
    vscode.setState(state);
  } else if (event.data.command == "highlightline") {
    const offset = getLineElementsAtPageOffset(event.data.content);
    if (offset) {
      const { previous, next, exact } = offset;
      const highlight = getHighlightLocationAndHeight(previous, next, exact);
      // const scrollTo = lineinfo.scrollTo;
      const linehighlight_active = document.getElementById("linehighlight_active");
      linehighlight_active.style.height = highlight.height + "px";
      linehighlight_active.style.top = highlight.location + "px";
    }
  }
});

function applyConfig() {
  //update line highlight visibility
  if (fountainconfig.synchronized_markup_and_preview) {
    document.getElementById("linehighlight_active").style.visibility = "visible";
    document.getElementById("linehighlight_click").style.visibility = "visible";
  } else {
    document.getElementById("linehighlight_active").style.visibility = "hidden";
    document.getElementById("linehighlight_click").style.visibility = "hidden";
  }

  console.log("update config");
  //update theme
  let themeClass = fountainconfig.preview_theme + "_theme";
  if (fountainconfig.preview_texture) {
    themeClass += " textured";
  }
  document.getElementById("fountain-js").setAttribute("class", themeClass);

  //update number alignments
  let pageClasses = "innerpage";
  if (fountainconfig.scenes_numbers == "left") pageClasses = "innerpage numberonleft";
  else if (fountainconfig.scenes_numbers == "right") pageClasses = "innerpage numberonright";
  else if (fountainconfig.scenes_numbers == "both")
    pageClasses = "innerpage numberonleft numberonright";
  document.getElementById("mainpage").className = pageClasses;
}

function applyHtml() {
  codeLineElements = [];
  vscode.setState(state);
  document.getElementById("mainpage").innerHTML = state.screenplay_html;
  if (state.title_html != undefined) {
    document.getElementById("titlepage_container").style.display = "block";
    document.getElementById("titlepage").innerHTML = state.title_html;
  } else {
    document.getElementById("titlepage_container").style.display = "none";
  }
}

function getLineInfoForElements(line, previous, next) {
  const scrollTo = 0;
  return { scrollTo: scrollTo, height: linehighlight_activeheight };
}

function scrollToRevealSourceLine(line, linescount, source) {
  scrollDisabled = true;
  if (line <= 0) {
    window.scroll(window.scrollX, 0);
    userscroll = true;
    return;
  }
  const { previous, next } = getElementsForSourceLine(line, linescount);
  if (!previous) {
    return;
  }

  const rect = getElement(previous).getBoundingClientRect();
  const previousTop = rect.top;
  linehighlight_activeheight = rect.height;
  if (next && next !== previous) {
    linehighlight_activeheight = 2;
    // Between two elements. Go to percentage offset between them.
    const betweenProgress = (line - previous) / (next - previous);
    const elementOffset = getElement(next).getBoundingClientRect().top - rect.bottom;
    scrollTo = rect.bottom + betweenProgress * elementOffset;
    if (getElement(previous).classList.contains("titlepagetoken")) {
      //the previous item is part of the title page, scroll to top of main page regardless of progress
      scrollTo = document.getElementById("screenplay_page").getBoundingClientRect().top;
    }
  } else {
    let progressInElement = 0;
    if (line != undefined) progressInElement = line - Math.floor(line);
    scrollTo = previousTop + rect.height * progressInElement;
  }

  if (getElement(previous) == document.getElementById("mainpage").firstChild) {
    scrollTo = document.getElementById("screenplay_page").getBoundingClientRect().top;
  }

  const scrolloptions = {
    top: Math.max(1, window.scrollY + scrollTo),
    left: window.scrollX,
  };

  if (
    source == "click" ||
    getElement(previous).classList.contains("titlepagetoken") ||
    (next && getElement(next).classList.contains("titlepagetoken"))
  ) {
    if (source == "click") {
      const linehighlight_active = document.getElementById("linehighlight_active");
      linehighlight_active.style.height = linehighlight_activeheight + "px";
      linehighlight_active.style.top =
        scrollTo - document.getElementById("screenplay_page").getBoundingClientRect().top + "px";
    }

    //don't scroll to the element, just ensure it's visible in the viewport
    if (scrollTo < 0) {
      //target is before, normal scrolling method works
      console.log("target is before");
    } else if (scrollTo > window.innerHeight) {
      //target is after
      scrolloptions.top = window.scrollY + scrollTo + rect.height + 24 - window.innerHeight;
      console.log("target is after");
    } else {
      console.log("target is in window");
      //target is in window, flash the relevant element if applicable
      return;
    }
  }
  window.scroll(scrolloptions);
}

function getElementsForSourceLine(targetLine, linescount) {
  const lineNumber = Math.floor(targetLine);
  const exact = document.getElementById("sourceline_" + lineNumber);
  if (exact) {
    return { previous: lineNumber, next: lineNumber };
  } else {
    let previousSearchNumber = lineNumber;
    let nextSearchNumber = lineNumber;
    let previousNumber, nextNumber;
    while (previousNumber == undefined) {
      previousSearchNumber--;
      if (previousSearchNumber < 0) {
        break;
      }
      const el = document.getElementById("sourceline_" + previousSearchNumber);
      if (el != undefined) previousNumber = previousSearchNumber;
    }
    while (nextNumber == undefined) {
      nextSearchNumber++;
      if (nextSearchNumber > linescount) {
        break;
      }
      nextNumber = document.getElementById("sourceline_" + nextSearchNumber);
      const el = document.getElementById("sourceline_" + nextSearchNumber);
      if (el != undefined) nextNumber = nextSearchNumber;
    }
    return { previous: previousNumber, next: nextNumber };
  }
}

let scrollDisabled = true,
  fountainconfig: any;
window.addEventListener(
  "scroll",
  throttle(() => {
    if (!fountainconfig.synchronized_markup_and_preview) return;
    if (scrollDisabled) {
      scrollDisabled = false;
    } else {
      const line = getEditorLineNumberForPageOffset(window.scrollY);
      if (typeof line === "number" && !isNaN(line)) {
        vscode.postMessage({ command: "revealLine", content: line, uri: state.docuri });
        state.offset = window.scrollY;
        vscode.setState(state);
      }
    }
  }, 50)
);

function getHighlightLocationAndHeight(previous, next, exact) {
  if (exact) {
    next = previous;
  }
  const rect = getElement(previous).getBoundingClientRect();
  const previousTop = rect.top;
  let linehighlight_height = rect.height;
  let linehighlight_location =
    rect.top - document.getElementById("screenplay_page").getBoundingClientRect().top;
  if (next && next !== previous) {
    linehighlight_height = 2;
    //located between the two
    const elementOffset = getElement(next).getBoundingClientRect().top - rect.bottom;
    linehighlight_location =
      rect.bottom +
      elementOffset * 0.5 -
      document.getElementById("screenplay_page").getBoundingClientRect().top;
  }
  return { height: linehighlight_height, location: linehighlight_location };
}

document.addEventListener("mousedown", (e) => {
  if (!fountainconfig.synchronized_markup_and_preview) return;
  const { previous, next, exact } = getLineElementsAtPageOffset(e.pageY);
  const linehighlight = getHighlightLocationAndHeight(previous, next, exact);
  if (e.detail == 1) {
    //first click, show click indicator
    const linehighlight_click = document.getElementById("linehighlight_click");
    linehighlight_click.style.height = linehighlight.height + "px";
    linehighlight_click.style.top = linehighlight.location + "px";
    linehighlight_click.style.transition = "opacity 0s";
    linehighlight_click.style.opacity = 1 + "";
    setTimeout(() => {
      linehighlight_click.style.transition = "opacity 0.5s";
      linehighlight_click.style.opacity = 0 + "";
    }, 5);
  }
  if (e.detail > 1) {
    //double click
    e.preventDefault();
    const linehighlight_active = document.getElementById("linehighlight_active");
    linehighlight_active.style.height = linehighlight.height + "px";
    linehighlight_active.style.top = linehighlight.location + "px";

    const offset = e.pageY;
    const positiononpage = window.innerHeight / e.pageY;
    const line = Math.floor(getEditorLineNumberForPageOffset(offset));
    if (typeof line === "number" && !isNaN(line)) {
      const charpos = window.getSelection().focusOffset;
      vscode.postMessage({
        command: "changeselection",
        line: Math.floor(line),
        character: charpos,
        positiononpage: positiononpage,
        uri: state.docuri,
      });
    }
  }
});
