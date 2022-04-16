/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Translate, { translate } from "@docusaurus/Translate";
import PaginatorNavLink from "@theme/PaginatorNavLink";
import React from "react";
import { useInView } from "react-intersection-observer";
import { animated, Transition } from "react-spring";

export default function BlogPostPaginator(props) {
  const { nextItem, prevItem } = props;
  const { ref, inView, entries } = useInView({ triggerOnce: true, delay: 500 });
  return (
    <nav
      ref={ref}
      className="pagination-nav docusaurus-mt-lg"
      aria-label={translate({
        id: "theme.blog.post.paginator.navAriaLabel",
        message: "Blog post page navigation",
        description: "The ARIA label for the blog posts pagination"
      })}
    >
      <Transition items={inView} from={{ scale: 0 }} enter={{ scale: 1 }} leave={{ scale: 0 }}>
        {({ scale }, inView) =>
          inView && (
            <>
              <animated.div
                className="pagination-nav__item"
                style={{ scale, transformOrigin: "left top", translateZ: 0 }}
              >
                {prevItem && (
                  <PaginatorNavLink
                    {...prevItem}
                    subLabel={
                      <Translate
                        id="theme.blog.post.paginator.newerPost"
                        description="The blog post button label to navigate to the newer/previous post"
                      >
                        Newer Post
                      </Translate>
                    }
                  />
                )}
              </animated.div>
              <animated.div
                className="pagination-nav__item pagination-nav__item--next"
                style={{ scale, transformOrigin: "right top", translateZ: 0 }}
              >
                {nextItem && (
                  <PaginatorNavLink
                    {...nextItem}
                    inverted
                    subLabel={
                      <Translate
                        id="theme.blog.post.paginator.olderPost"
                        description="The blog post button label to navigate to the older/next post"
                      >
                        Older Post
                      </Translate>
                    }
                  />
                )}
              </animated.div>
            </>
          )
        }
      </Transition>
    </nav>
  );
}
