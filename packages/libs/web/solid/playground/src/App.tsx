import { Component, createEffect } from "solid-js";
import { createSignal } from "solid-js";
import logo from "./logo.svg";
import styles from "./App.module.css";
import css from "./App.module.css"

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
  const div = (
    <>
      <Button
        onClick={(e) => {
          setValue(value() + 1);
        }}
      >
        {children}
      </Button>
      <div class={styles.App}>
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
            Learn Solid {value()}
          </a>
        </header>
      </div>
    </>
  );
  return div;
};
console.log(App);
export default App;
