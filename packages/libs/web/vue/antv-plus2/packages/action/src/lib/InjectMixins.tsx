// import AutoOperationBar from ".";
// import { VCProps } from "../../interface";
// import { Component } from "@antv-plus2/helper";

// @Component({
//   components: { AutoOperationBar } as any,
// })
// export class AutoOperationBarInjectMixinsProps extends Vue implements IAutoOperationBarInjectProps {
//   /**
//    * 配置操作栏按钮props
//    * 参照组件AutoOperationBar
//    */
//   @Prop({ type: Object, default: null })
//   public operation?: IAutoOperationBarProps;
//   /**
//    * AutoOperationBar的class
//    */
//   @Prop({ type: null, default: null })
//   public operationClass?: any;

//   /**
//    * AutoOperationBar的style
//    */
//   @Prop({ type: null, default: null })
//   public operationStyle?: any;
// }
// export interface IAutoOperationBarInjectProps extends VCProps<AutoOperationBarInjectMixinsProps> {}

// @Component
// export class AutoOperationBarInjectMixins
//   extends AutoOperationBarInjectMixinsProps
//   implements IAutoOperationBarInjectProps {
//   protected get autoOperationListeners() {
//     const keys = Object.keys(this.$listeners).filter((k) => /^action\:/gi.test(k));
//     // debugger
//     return keys.reduce(
//       (o, k) => Object.assign(o, { [k.replace(/^action\:/gi, "")]: this.$listeners[k] }),
//       {}
//     );
//   }

//   renderAutoOperationBar(props: any = {}) {
//     return (
//       // @ts-ignore
//       <AutoOperationBar
//         class={this.operationClass}
//         style={this.operationStyle}
//         {...{
//           props,
//           on: this.autoOperationListeners,
//         }}
//       />
//     );
//   }
// }

// export default AutoOperationBarInjectMixins;
