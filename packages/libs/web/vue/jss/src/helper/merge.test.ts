import { appendExtends, define } from "./merge";
const button0 = {
  padding: "20px",
  background: "blue",
};
const getBack = {
  background: (data) => {
    return data.background;
  },
};
const redButton = define({
  padding: "10px",
  extend: [
    {
      padding: "5px",
    },
    getBack,
  ],
});
const extend = [button0, redButton];
const styles = {
  button0,
  button1: appendExtends(
    {
      // padding: "20px",
      // background: () => "white"
    },
    extend
  ),
};
console.log(styles);
