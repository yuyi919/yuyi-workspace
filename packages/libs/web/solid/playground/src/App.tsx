import {
  Component,
  createEffect,
  createRenderEffect,
  createSignal,
  onMount,
  createMemo,
} from "solid-js";
import { addEventListener, spread, delegateEvents, getNextElement } from "solid-js/web";
import styles from "./App.module.css";
import logo from "./logo.svg";
import { renderClass, styled, ThemeProvider } from "./styled";
import { model } from "./model";
import { styled as styled2 } from "goober/macro";
import { glob } from "goober";

// console.log(Button2);
const theme = {
  colors: {
    primary: "red",
  },
};
const SomeText = styled("div")`
  color: ${(props) => props.theme.colors.primary};
`;
type P = { onClick: (e: any) => any; size: number };
const Button: Component<P> = (props) => {
  //@ts-ignore
  const name = createMemo(() => props.className + " ant-btn");
  return (
    // @ts-ignore
    <button onClick={props.onClick} className={name()}>
      {props.children}
    </button>
  );
};

const StyledButton = styled(Button)`
  margin: 0;
  padding: 1rem;
  font-size: ${(props) => props.size}px;
  background-color: tomato;
`;

let i = 0;
const global2 = () => {
  glob`
    html,
    body {
      background: light;
    }
    #root {
      font-size: ${i++}px;
    }
    * {
      box-sizing: border-box;
    }
  `;
};
model;
const App: Component = (props) => {
  const [value, setValue] = createSignal(1);
  createEffect(() => {
    // setInterval(() => {
    //   setValue(value() + 1);
    //   // global2();
    // }, 1000);
  });
  let myDiv: any;
  const [name, setName] = createSignal("");
  createRenderEffect(() => {
    console.log(name());
    // spread(myDiv, { "data-index": value() + 1 });
  });
  onMount(() => console.log(myDiv));

  // const temp = button.$$click
  // addEventListener(button, "click",  (e) => {
  //   temp(e)
  //   setValue(value() + 1);
  // }, true)
  return (
    <ThemeProvider theme={theme}>
      <StyledButton
        size={value()}
        onClick={(e) => {
          console.log(e);
          setValue(value() + 1);
        }}
      >
        increment
      </StyledButton>
      <label>
        Id
        <input type="text" use:model={[name, setName]} />
      </label>
      <div ref={myDiv}>{props.children}</div>
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
            <div className={styles.App}>Learn Solid {value()}</div>
          </a>
        </header>
      </SomeText>
    </ThemeProvider>
  );
};
export default App;
