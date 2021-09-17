import { Component, createEffect } from "solid-js";
import { createSignal } from "solid-js";
import logo from "./logo.svg";
import styles from "./App.module.css";
import { styled, ThemeProvider, setup } from "./styled";

const theme = {
  colors: {
    primary: "red",
  },
};
const SomeText = styled("div")`
  color: ${(props) => props.theme.colors.primary};
`;

const Button: Component<{ onClick: (e: any) => any }> = (props) => {
  return <button onClick={props.onClick}>{props.children}</button>;
};

const App: Component = ({ children }) => {
  const [value, setValue] = createSignal(1);
  createEffect(() => {
    setInterval(() => {
      setValue(value() + 1);
    }, 1000);
  });
  return (
    <ThemeProvider theme={theme}>
      <Button
        onClick={(e) => {
          setValue(value() + 1);
        }}
      >
        {children}
      </Button>
      <SomeText className={styles.App}>
        <header class={styles.header}>
          <img src={logo} class={styles.logo} alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            class={styles.link}
            href="https://github.com/solidjs/solid"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SomeText className={styles.App}>Learn Solid {value()}</SomeText>
          </a>
        </header>
      </SomeText>
    </ThemeProvider>
  );
};
export default App;
