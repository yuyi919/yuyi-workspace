/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { FrameBox, FrameHexagon, Text } from "@arwes/core";
import { useBleeps } from "@arwes/sounds";
import Link from "@docusaurus/Link";
import React from "react";
import { SoundType } from "../ArwesTheme";
import styles from "./custom.module.less";
import clsx from "clsx";
import { useBlogLayout } from "../shared";

export default function PaginatorNavLink(props) {
  const { inverted, permalink, title, subLabel } = props;
  const bleeps = useBleeps();
  const blogLayout = useBlogLayout();
  const { callCursor, callMouseLeave, isHover } = useCursor(bleeps);
  const callClick = React.useCallback(
    /**
     *
     * @param {React.MouseEvent<any>} e
     */
    (e) => {
      if (blogLayout.injected) {
        e.preventDefault();
        e.stopPropagation();
        blogLayout.redirectTo(permalink);
        bleeps[SoundType.click].play();
      }
    },
    [bleeps, permalink]
  );
  return (
    <Link
      className={clsx("pagination-nav__link", styles.link)}
      style={{ border: 0, padding: 0 }}
      to={permalink}
      onClick={callClick}
    >
      <FrameHexagon
        style={{ width: "100%" }}
        palette="secondary"
        onMouseEnter={callCursor}
        onMouseLeave={callMouseLeave}
        hideShapes={!isHover}
        inverted={!inverted}
        hover
      >
        {subLabel && (
          <div className="pagination-nav__sublabel">
            <Text>{subLabel}</Text>
          </div>
        )}
        <Text className="pagination-nav__label">{title}</Text>
      </FrameHexagon>
    </Link>
  );
}
function useCursor(bleeps) {
  const [isHover, setHover] = React.useState(false);
  const callCursor = React.useCallback(
    (e) => {
      if (!isHover) {
        bleeps[SoundType.cursor].play();
        // isHover.current = true;
        setHover(true);
      }
    },
    [bleeps]
  );
  const callMouseLeave = React.useCallback((e) => {
    requestAnimationFrame(() => {
      // isHover.current = false;/
      setHover(false);
    });
  }, []);
  return { callCursor, callMouseLeave, isHover };
}
