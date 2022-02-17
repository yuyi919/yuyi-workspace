import { animated, useSpring } from "@react-spring/web";
import React from "react";

export function SNumber({ number, ...props }) {
  const next = useSpring({
    number: number ? (number as number) : 0,
    config: {
      mass: 10,
      tension: 1000,
      friction: 100,
    },
  });
  console.log(next.number.to((x) => (x * 100).toFixed(0)));
  return <animated.span>{next.number.to((x) => (x * 100).toFixed(0))}</animated.span>;
}

//定时上下滚动
function useTimingRolling(time = 1000, distance?: any) {
  const [scrolling, setScrolling] = useSpring(() => ({ from: { scroll: 0 } }));
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!distance) {
      distance = ref.current.clientHeight;
    }
  }, []);
  React.useEffect(() => {
    const intervalID = setInterval(() => {
      setScrolling({ scroll: ref.current.scrollTop + distance });
      if (Math.ceil(ref.current.scrollTop + ref.current.clientHeight) >= ref.current.scrollHeight) {
        setScrolling({ scroll: 0 });
      }
    }, time);
    return () => {
      clearInterval(intervalID);
    };
  }, [distance]);
  return [scrolling.scroll, ref] as const;
}

export function Chestnut() {
  const [timeTable, timeTableRef] = useTimingRolling(1000, 20);
  return (
    <animated.div style={{ height: 60, overflow: "auto" }} scrollTop={timeTable} ref={timeTableRef}>
      {new Array(10).fill("chestnut").map((item, i) => (
        <animated.div style={{ color: "white" }} key={i}>
          {item}
          {i}
        </animated.div>
      ))}
    </animated.div>
  );
}
