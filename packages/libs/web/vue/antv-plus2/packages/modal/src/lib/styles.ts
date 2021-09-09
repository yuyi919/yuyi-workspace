import { createUseClasses, styled } from "@yuyi919/vue-antv-plus2-theme";

const [classes, useClasses, ClassesProps] = createUseClasses("modal", {
  wrap: "wrap",
});

export const useStyles = styled.makeUse`
  &${classes.root} {
    ${classes.wrap} {
    }
  }
`;

export { useClasses, ClassesProps };
