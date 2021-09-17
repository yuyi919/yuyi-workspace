import { Component, createEffect } from "solid-js";
import { createSignal } from "solid-js";

import logo from "./logo.svg";
import styles from "./App.module.css";

const App: Component = ({ children }) => {
  const [value, setValue] = createSignal(1);
  createEffect(() => {
    setInterval(() => {
      setValue(value() + 1);
    }, 1000);
  });
  const div = (
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
          {children}
        </a>
      </header>
    </div>
  );
  return div;
};

export default App;
