// The <Button /> component encapsulates an animated <FrameComponent />.
// The <Button /> component will pass its received `animator` prop directly to the
// <FrameComponent /> to simplify the animator management.

// TODO: There needs to be a better way to compose animator components
// like the Button component manipulates the Framecomponent.

/* @jsx jsx */
import {
  FC,
  MutableRefObject,
  CSSProperties,
  MouseEvent,
  useState,
  useMemo,
  useRef,
  useCallback,
  DOMAttributes
} from "react";
import PropTypes from "prop-types";
import { cx } from "@emotion/css";
import { jsx, useTheme } from "@emotion/react";
import { WithAnimatorOutputProps, AnimatorFlow } from "@arwes/animation";
import { useBleeps } from "@arwes/sounds";

import { FRAME_EFFECTS } from "@arwes/core/lib/utils/Frame";
import { FrameUnderline } from "@arwes/core/lib/FrameUnderline";
import { generateStyles } from "@arwes/core/lib/Button/Button.styles";

interface ButtonProps {
  // TODO: Properly create a type for a common composable frame component.
  FrameComponent?: any;
  palette?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  style?: CSSProperties;
  rootRef?: MutableRefObject<HTMLButtonElement | null> | ((node: HTMLButtonElement) => void);
}

// The component will receive the `animator` as `AnimatorInstanceSettings` and
// not as `AnimatorRef` since it is encapsulating another animated component.
// That's why the props accepts `WithAnimatorOutputProps`, not the input one.
const Button: FC<DOMAttributes<SVGElement> & ButtonProps & WithAnimatorOutputProps> = (props) => {
  const {
    animator: animatorSettings,
    FrameComponent,
    palette,
    disabled,
    active,
    onClick,
    className,
    style,
    rootRef,
    children,
    ...other
  } = props;

  const theme = useTheme();
  const bleeps = useBleeps();
  const styles = useMemo(
    () => generateStyles(theme, { palette, disabled }),
    [theme, palette, disabled]
  );

  const effectsRef = useRef<FRAME_EFFECTS | null>(null);

  // A copy of the <FrameComponent/> animator flow for the <Button/> functionalities.
  const [flow, setFlow] = useState<AnimatorFlow | null>(null);

  const buttonOnClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>): void => {
      const isAnimated = !!flow; // If flow exist, it means it's animated.
      const isEntered = isAnimated ? flow?.entered : true; // No animated? Then it's entered.

      if (!disabled && isEntered) {
        effectsRef.current?.highlight();
        bleeps.click?.play();
        onClick?.(event);
      }
    },
    [flow, onClick, bleeps]
  );

  return (
    <FrameComponent
      animator={{
        ...animatorSettings,
        onTransition: (flow: AnimatorFlow) => {
          setFlow(flow);
          animatorSettings?.onTransition?.(flow);
        }
      }}
      as="button"
      className={cx("arwes-button", className)}
      css={[styles.root, !!flow && !flow.entered && styles.rootIsTransitioning]}
      style={style}
      rootRef={rootRef}
      effectsRef={effectsRef}
      palette={palette}
      disabled={disabled}
      hideShapes={!active}
      hover
      onClick={buttonOnClick}
      {...other}
    >
      {children}
    </FrameComponent>
  );
};

Button.propTypes = {
  FrameComponent: PropTypes.any.isRequired,
  palette: PropTypes.string,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  rootRef: PropTypes.any
};

Button.defaultProps = {
  FrameComponent: FrameUnderline,
  palette: "secondary"
};

export { ButtonProps, Button };
