import {
  createUseClasses,
  defineKeyframes,
  KeyframePoint,
  styled,
  style2Str,
} from "@antv-plus2/theme";
import { NativeScrollbarMixins } from "@antv-plus2/shared";
import { IModalProps } from "../props";

const [classes, useClasses, ClassesProps] = createUseClasses("normalize-modal", {
  content: "content",
});

export function createAnimTransitionMixins(
  name: string,
  enterAnimation: [KeyframePoint, KeyframePoint, ...KeyframePoint[]],
  leaveAnimation: [KeyframePoint, KeyframePoint, ...KeyframePoint[]]
) {
  const warpIn = defineKeyframes(enterAnimation);
  const warpOut = defineKeyframes(leaveAnimation);
  const [start] = enterAnimation;
  return styled.createMixin`
    .ant-modal {
      &.${name}-enter, &.${name}-appear {
        ${style2Str(start instanceof Array ? start[1] : start)}
      }

      &.${name}-enter, &.${name}-appear, &.${name}-leave {
        animation-duration: ${(props: IModalProps) => props.transitionDuration}ms;
        animation-fill-mode: both;
        animation-timing-function: ease-out;
        animation-play-state: paused;
      }

      &.${name}-enter.${name}-enter-active, &.${name}-appear.${name}-appear-active {
        animation-name: ${warpIn};
        animation-play-state: running;
      }

      &.${name}-leave.${name}-leave-active {
        animation-name: ${warpOut};
        animation-play-state: running;
      }
    }
  `;
}

const noBorder = styled.createMixin`
  border-top: none;
  padding: 0 32px 24px 0;
`;
export const useStyles = styled.makeUse`
  &${classes.root} {
    .ant-modal-wrap {
      ${NativeScrollbarMixins("9px", "white")};
      .ant-modal {
        padding-bottom: 0;
        & > .ant-modal-content {
          & > .ant-modal-body {
            padding: 0;
            ${classes.content} {
              padding: 24px;
            }
          }
          & > .ant-modal-footer {
            ${(props) => props.footerBorder === false && noBorder}
          }
        }
      }
      ${createAnimTransitionMixins(
        "slide-zoom",
        [
          { opacity: "0", transformOrigin: "0% 0%", transform: "translateY(-25%) scale(0)" },
          { opacity: "1", transformOrigin: "0% 0%", transform: "translateY(0) scale(1)" },
        ],
        [
          { opacity: "1", transformOrigin: "0% 0%", transform: "translateY(0) scale(1)" },
          { opacity: "0", transformOrigin: "0% 0%", transform: "translateY(-25%) scale(0)" },
        ]
      )}
      ${createAnimTransitionMixins(
        "slide-fade",
        [
          { opacity: "0", transform: "translateY(-25%)" },
          { opacity: "1", transform: "translateY(0)" },
        ],
        [
          { opacity: "1", transform: "translateY(0)" },
          { opacity: "0", transform: "translateY(-25%)" },
        ]
      )}
    }
  }
`;

export { useClasses, ClassesProps };
