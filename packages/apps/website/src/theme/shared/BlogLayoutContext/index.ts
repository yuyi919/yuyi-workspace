import { useHistory } from "@docusaurus/router";
import React from "react";

export interface BlogLayoutState {
  phase: "enter" | "leave";
  redirectTo(path: string): Promise<void>;
  isActive(path: string): boolean;
  injected: boolean;
}

const Context = React.createContext<BlogLayoutState>({
  phase: "enter",
  redirectTo: async () => {},
  isActive: () => false,
  injected: false
});

export function createBlogLayout() {
  const history = useHistory();
  const [, update] = React.useState(0);
  const blogLayout = React.useMemo(() => {
    let handle: (value?: unknown) => void, _resolveTo: string;
    const config = {
      phase: "enter",
      injected: true,
      redirectTo(path: string) {
        _resolveTo = path;
        if (config.phase !== "leave") {
          console.log("redirectTo", _resolveTo);
          config.phase = "leave";
          update((x) => (x + 1) % 2);
        }
        return new Promise((resolve) => {
          handle = resolve;
        });
      },
      isActive(path: string) {
        return history.location.pathname === path;
      },
      onLeaveEnd(e) {
        if (config.phase === "leave" && _resolveTo) {
          handle?.();
          console.log("leaveEnd", _resolveTo, e);
          history.push(_resolveTo);
          config.phase = "leaveEnd";
        }
      }
    };
    return config;
  }, [history]);
  console.log(blogLayout.phase, blogLayout);
  return blogLayout;
}

export function useBlogLayout() {
  return React.useContext(Context);
}

export const { Provider: BlogLayoutProvider } = Context;
