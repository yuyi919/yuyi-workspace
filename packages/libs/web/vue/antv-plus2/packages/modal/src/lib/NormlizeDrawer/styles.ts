import { autoSizer, createUseClasses, styled } from "@antv-plus2/theme";
import { IModalProps } from "../props";

const [classes, useClasses] = createUseClasses("normalize-drawer", {
  footer: "footer",
  content: "content",
});

export const PADDING = 24;

const noBorder = styled.createMixin`
  &.ant-drawer-top,
  &.ant-drawer-bottom {
    & > .ant-drawer-content-wrapper {
      & > .ant-drawer-content > .ant-drawer-wrapper-body {
        & > .ant-drawer-body {
          & > ${classes.footer} {
            padding-bottom: 24px;
          }
        }
      }
    }
  }

  &.ant-drawer-left
    > .ant-drawer-content-wrapper
    > .ant-drawer-content
    > .ant-drawer-wrapper-body
    > .ant-drawer-body
    > ${classes.footer} {
    padding: 0 32px 24px 0;
  }

  &.ant-drawer-right
    > .ant-drawer-content-wrapper
    > .ant-drawer-content
    > .ant-drawer-wrapper-body
    > .ant-drawer-body
    > ${classes.footer} {
    padding: 0 0 24px 32px;
  }
`;

export const useStyles = styled.makeUse`
  &${classes.root} {
    display: flex;
    & > .ant-drawer-content-wrapper {
      & > .ant-drawer-content > .ant-drawer-wrapper-body {
        & > .ant-drawer-body {
          padding: 0;
          ${classes.content} {
            padding: ${PADDING}px;
          }
          & > ${classes.footer} {
            border-top: ${(props) => props.footerBorder === false && "none"};
          }
        }
      }
    }

    ${(props) => props.footerBorder === false && noBorder};

    &.ant-drawer-left,
    &.ant-drawer-right {
      & > .ant-drawer-content-wrapper {
        & > .ant-drawer-content > .ant-drawer-wrapper-body {
          overflow-y: hidden;
          & > .ant-drawer-body {
            & > ${classes.footer} {
              position: absolute;
              bottom: 0;
              width: 100%;
            }
          }
        }
      }
    }

    &.ant-drawer-bottom,
    &.ant-drawer-top {
      place-content: center;
      & > .ant-drawer-content-wrapper {
        /* 取消100%宽度 */
        width: ${(props) =>
          props.width === "auto" || !props.width ? void 0 : autoSizer(props.width)};
        /* width: ${(props: IModalProps) =>
          props.width === "auto" ? "100%" : autoSizer(props.width)}; */
      }
    }

    &.ant-drawer-top {
      & > .ant-drawer-content-wrapper {
        & > .ant-drawer-content {
          border-radius: 0 0 4px 4px;
        }
      }
    }

    &.ant-drawer-bottom {
      & > .ant-drawer-content-wrapper {
        & > .ant-drawer-content {
          border-radius: 4px 4px 0 0;
        }
      }
    }

    &.ant-drawer-left {
      & > .ant-drawer-content-wrapper {
        & > .ant-drawer-content {
          border-radius: 0 4px 4px 0;
        }
      }
    }

    &.ant-drawer-right {
      & > .ant-drawer-content-wrapper {
        & > .ant-drawer-content {
          border-radius: 4px 0 0 4px;
        }
      }
    }
  }
`;

export { useClasses };
