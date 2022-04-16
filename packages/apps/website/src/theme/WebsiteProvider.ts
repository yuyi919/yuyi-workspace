import React from "react";
const Context = React.createContext({
  prevPageType: "",
  notify: (message: string) => {}
});

export function useWebsite() {
  return React.useContext(Context);
}

export const { Provider: WebsiteProvider } = Context;
