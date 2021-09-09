declare module "*.vue" {
  import { defineComponent } from "vue";
  const component: ReturnType<typeof defineComponent>;
  export default component;
}
declare module "*.txt" {
  export default null as string
}
