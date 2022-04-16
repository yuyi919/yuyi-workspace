/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import Translate, { translate } from "@docusaurus/Translate";
import PaginatorNavLink from "@theme/PaginatorNavLink";
import { useInView } from "react-intersection-observer";
import { Transition, animated, config } from "react-spring";
export default function DocPaginator(props) {
  const { previous, next } = props;
  const { ref, inView, entries } = useInView({ triggerOnce: true, delay: 500 });
  return (
    <nav
      ref={ref}
      className="pagination-nav docusaurus-mt-lg"
      aria-label={translate({
        id: "theme.docs.paginator.navAriaLabel",
        message: "Docs pages navigation",
        description: "The ARIA label for the docs pagination"
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
                {previous && (
                  <PaginatorNavLink
                    {...previous}
                    subLabel={
                      <Translate
                        id="theme.docs.paginator.previous"
                        description="The label used to navigate to the previous doc"
                      >
                        Previous
                      </Translate>
                    }
                  />
                )}
              </animated.div>
              <animated.div
                className="pagination-nav__item pagination-nav__item--next"
                style={{ scale, transformOrigin: "right top", translateZ: 0 }}
              >
                {next && (
                  <PaginatorNavLink
                    {...next}
                    inverted
                    subLabel={
                      <Translate
                        id="theme.docs.paginator.next"
                        description="The label used to navigate to the next doc"
                      >
                        Next
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
