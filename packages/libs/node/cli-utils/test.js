// @ts-check
const { setupMain, BotConfig } = require("./dist/parser")

const [next, { config }] = setupMain({
  bot: BotConfig
})
next.then((main) => {
  console.log(main, config)
})
