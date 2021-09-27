/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { x } from "./";

@x.Plugin()
export class Base {
  /**
   * 测试测试
   * @beta
   * @description ttt
   * @name test
   * @deprecated
   * as213
   * @ttt ce
   */
  @x.Param()
  @x.Text("名称")
  name: string = "1";

  /**
   * 测试测试
   */
  @x.Param()
  @x.Text("配置项")
  @x.Type(() => BaseDTO)
  dtos: BaseDTO[] = [];

  @x.Command()
  render() {
    return;
  }
}

@x.Struct()
export class BaseDTO {
  /**
   * 测试测试
   */
  @x.Param()
  @x.Text("名称")
  name: string;

  @x.Param()
  @x.Text("键")
  id: number;
}

export class Base22 {}
