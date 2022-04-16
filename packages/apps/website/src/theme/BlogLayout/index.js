/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import BlogSidebar from "@theme/BlogSidebar";
import { Spring, animated } from "react-spring";
import { BlogLayoutProvider, createBlogLayout, useBlogLayout, useMountBeep } from "../shared";
import { useWebsite } from "../WebsiteProvider";
import { SoundType } from "../ArwesTheme";

export default function BlogLayout(props) {
  const { sidebar, toc, children, ...layoutProps } = props;
  const website = useWebsite();
  const hasSidebar = sidebar && sidebar.items.length > 0;
  const blogLayout = createBlogLayout();
  useMountBeep((bleep) => website.prevPageType !== "blog" && bleep[SoundType.Menu]);
  return (
    <BlogLayoutProvider value={blogLayout}>
      <Layout {...layoutProps}>
        <div className="container margin-vert--lg">
          <div className="row">
            {hasSidebar && (
              <aside className="col col--3">
                <BlogSidebar sidebar={sidebar} />
              </aside>
            )}
            <Spring
              from={{ translateX: 300, translateZ: 0, opacity: 0 }}
              to={
                blogLayout.phase === "enter"
                  ? { translateX: 0, opacity: 1 }
                  : { translateX: 300, opacity: 0 }
              }
              onResolve={blogLayout.onLeaveEnd}
            >
              {(style) => (
                <animated.main
                  className={clsx("col", {
                    "col--7": hasSidebar,
                    "col--9 col--offset-1": !hasSidebar
                  })}
                  itemScope
                  itemType="http://schema.org/Blog"
                  style={style}
                >
                  {children}
                </animated.main>
              )}
            </Spring>
            {toc && <div className="col col--2">{toc}</div>}
          </div>
        </div>
      </Layout>
    </BlogLayoutProvider>
  );
}
