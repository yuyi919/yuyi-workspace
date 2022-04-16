/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { List, Text } from "@arwes/core";
import Link from "@docusaurus/Link";
import { translate } from "@docusaurus/Translate";
import type { Props } from "@theme/BlogSidebar";
import clsx from "clsx";
import React from "react";
import { useBlogLayout } from "../shared";
import { useWebsite } from "../WebsiteProvider";
import styles from "./styles.module.css";

export default function BlogSidebar({ sidebar }: Props) {
  // const history = useHistory();
  const blogLayout = useBlogLayout();
  const { prevPageType } = useWebsite();
  const [state, setState] = React.useState<string>();
  if (sidebar.items.length === 0) {
    return null;
  }
  return (
    <nav
      className={clsx(styles.sidebar, "thin-scrollbar")}
      aria-label={translate({
        id: "theme.blog.sidebar.navAriaLabel",
        message: "Blog recent posts navigation",
        description: "The ARIA label for recent posts in the blog sidebar"
      })}
    >
      <List
        className={styles.sidebarItemList}
        animator={{ activate: blogLayout.phase === "enter" }}
      >
        <Text className={clsx(styles.sidebarItemTitle, "margin-bottom--md")}>{sidebar.title}</Text>
        {sidebar.items.map((item) => (
          <li key={item.permalink} className={styles.sidebarItem}>
            <Link
              to={item.permalink}
              isNavLink
              className={styles.sidebarItemLink}
              activeClassName={styles.sidebarItemLinkActive}
              isActive={state ? () => state === item.permalink : void 0}
              onClick={(e) => {
                // 手动控制
                e.stopPropagation();
                e.preventDefault();
                // console.log(item);
                if (!blogLayout.isActive(item.permalink)) {
                  // console.log(item);
                  blogLayout.redirectTo(item.permalink);
                  setState(item.permalink);
                }
              }}
            >
              <Text>{item.title}</Text>
            </Link>
          </li>
        ))}
      </List>
    </nav>
  );
}
