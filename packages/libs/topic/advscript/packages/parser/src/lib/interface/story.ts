export interface IContent {
  type: "content";
  command: "text" | (string & {});
  flags: string[];
  params: Record<string, any>;
  text: string;
}
