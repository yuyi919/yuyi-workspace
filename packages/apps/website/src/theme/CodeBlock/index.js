/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { isValidElement, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Highlight, { defaultProps } from "prism-react-renderer";
import copy from "copy-text-to-clipboard";
import Translate, { translate } from "@docusaurus/Translate";
import {
  useThemeConfig,
  parseCodeBlockTitle,
  parseLanguage,
  parseLines,
  ThemeClassNames,
  usePrismTheme
} from "@docusaurus/theme-common";
import styles from "./styles.module.css";
import styles2 from "./styles.module.less";
import { CodeBlock, Text } from "@arwes/core";
import { useInView } from "react-intersection-observer";

export default function ({
  children,
  className: blockClassName = "",
  metastring,
  title,
  language: languageProp
}) {
  const { prism } = useThemeConfig();
  const { ref, inView } = useInView({ triggerOnce: true, delay: 300 });
  const [mounted, setMounted] = useState(false); // The Prism theme on SSR is always the default theme but the site theme
  // can be in a different mode. React hydration doesn't update DOM styles
  // that come from SSR. Hence force a re-render after mounting to apply the
  // current relevant styles. There will be a flash seen of the original
  // styles seen using this current approach but that's probably ok. Fixing
  // the flash will require changing the theming approach and is not worth it
  // at this point.

  useEffect(() => {
    setMounted(true);
  }, []); // We still parse the metastring in case we want to support more syntax in the
  // future. Note that MDX doesn't strip quotes when parsing metastring:
  // "title=\"xyz\"" => title: "\"xyz\""

  const codeBlockTitle = parseCodeBlockTitle(metastring) || title;
  const prismTheme = usePrismTheme(); // <pre> tags in markdown map to CodeBlocks and they may contain JSX children.
  // When the children is not a simple string, we just return a styled block
  // without actually highlighting.

  if (React.Children.toArray(children).some((el) => isValidElement(el))) {
    return (
      <Highlight
        {...defaultProps}
        key={String(mounted)}
        theme={prismTheme}
        code=""
        language={"text"}
      >
        {({ className, style }) => (
          <div ref={ref}>
            {inView && (
              <pre
                /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
                tabIndex={0}
                className={clsx(
                  className,
                  styles.codeBlockStandalone,
                  "thin-scrollbar",
                  styles.codeBlockContainer,
                  blockClassName,
                  ThemeClassNames.common.codeBlock
                )}
                style={style}
              >
                <code className={styles.codeBlockLines}>{children}</code>
              </pre>
            )}
          </div>
        )}
        <CopyButton rootRef={ref} code={""} />
      </Highlight>
    );
  } // The children is now guaranteed to be one/more plain strings

  const content = Array.isArray(children) ? children.join("") : children;
  const language = languageProp ?? parseLanguage(blockClassName) ?? prism.defaultLanguage;
  const { highlightLines, code } = parseLines(content, metastring, language);

  return (
    <Highlight
      {...defaultProps}
      key={String(mounted)}
      theme={prismTheme}
      code={code}
      language={language ?? "text"}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <div
          ref={ref}
          className={clsx(
            styles.codeBlockContainer,
            blockClassName,
            {
              [`language-${language}`]: language && !blockClassName.includes(`language-${language}`)
            },
            ThemeClassNames.common.codeBlock,
            styles2.arwesCodeBlock
          )}
        >
          {codeBlockTitle && (
            <div style={style} className={styles.codeBlockTitle}>
              <Text animator={{ activate: inView }}>{codeBlockTitle}</Text>
            </div>
          )}
          <div className={clsx(styles.codeBlockContent, language)}>
            <CodeBlock
              animator={{ activate: inView }}
              lang={language}
              className={clsx(className, styles.codeBlock, "thin-scrollbar")}
              style={style}
              contentTextProps={{
                as: "pre",
                tabIndex: 0,
                style: { display: "block", overflow: "visible" },
                blink: false
              }}
            >
              <code className={styles.codeBlockLines} style={{ margin: -20 }}>
                {tokens.map((line, i) => {
                  if (line.length === 1 && line[0].content === "\n") {
                    line[0].content = "";
                  }

                  const lineProps = getLineProps({
                    line,
                    key: i
                  });

                  if (highlightLines.includes(i)) {
                    lineProps.className += " docusaurus-highlight-code-line";
                  }

                  return (
                    <span key={i} {...lineProps}>
                      {line.map((token, key) => (
                        <span
                          key={key}
                          {...getTokenProps({
                            token,
                            key
                          })}
                        />
                      ))}
                      <br />
                    </span>
                  );
                })}
              </code>
            </CodeBlock>

            <CopyButton rootRef={ref} code={code} />
          </div>
        </div>
      )}
    </Highlight>
  );
}
const CopyButton = ({ rootRef, code }) => {
  const [showCopied, setShowCopied] = useState(false);
  const timeout = useRef(0);
  const handleCopyCode = () => {
    if (timeout.current > 0) {
      clearTimeout(timeout.current);
      timeout.current = 0;
    }
    console.log(rootRef);
    copy(code);
    setShowCopied(true);
    timeout.current = setTimeout(() => setShowCopied(false), 2000);
  };
  return (
    <button
      type="button"
      aria-label={translate({
        id: "theme.CodeBlock.copyButtonAriaLabel",
        message: "Copy code to clipboard",
        description: "The ARIA label for copy code blocks button"
      })}
      className={clsx(styles.copyButton, "clean-btn", styles2.copyButton)}
      onClick={handleCopyCode}
    >
      {showCopied ? (
        <Translate id="theme.CodeBlock.copied" description="The copied button label on code blocks">
          Copied
        </Translate>
      ) : (
        <Translate id="theme.CodeBlock.copy" description="The copy button label on code blocks">
          Copy
        </Translate>
      )}
    </button>
  );
};
