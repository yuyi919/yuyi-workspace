import { x } from "@yuyi919/rpgmz-plugin-transformer";

@x.Struct()
export class TextboxConfig {
  /**
   * 将你的对话框图像放置于system文件夹下，然后在这里填写图片名称。（无需后缀）
   * @dir img/system
   */
  @x.Param()
  @x.Text("对话框图像名称")
  @x.Type("file")
  对话框图像名称: string = "textbox";

  @x.Param()
  @x.Text("对话框宽度")
  对话框宽度: number;

  @x.Param()
  @x.Text("对话框高度")
  对话框高度: number;

  @x.Param()
  @x.Text("对话框x偏移量")
  对话框x偏移量: number;

  @x.Param()
  @x.Text("对话框y偏移量")
  _windowYOffset: number = 0;

  get windowYOffset() {
    return this._windowYOffset;
  }

  @x.Param()
  @x.Text("脸图x偏移量")
  脸图x偏移量: number;

  @x.Param()
  @x.Text("脸图y偏移量")
  脸图y偏移量: number;

  @x.Param()
  @x.Text("姓名框fontsize")
  姓名框fontsize: number = 40;

  @x.Param()
  @x.Text("脸图宽度")
  脸图宽度: number = 165;

  /**
   * 如果为0，自动取脸图宽度
   */
  @x.Param()
  @x.Text("脸图高度")
  @x.DefaultFilter((value) => !!value)
  脸图高度: number = this.脸图宽度;

  @x.Param()
  @x.Text("对话文本偏移量x")
  对话文本偏移量x: number = 20;

  @x.Param()
  @x.Text("对话文本最大宽度")
  textMaxWidth: number;

  @x.Param()
  @x.Text("对话文本偏移量y")
  对话文本偏移量y: number = 60;

  @x.Param()
  @x.Text("对话框背景图片的X")
  对话框背景图片的X: number = 0;

  @x.Param()
  @x.Text("对话框背景图片的Y")
  对话框背景图片的Y: number = 0;

  /**
   * 将你的对话框图像放置于system文件夹下，然后在这里填写图片名称。（无需后缀）
   * @default "namebox"
   * @dir img/system
   */
  @x.Param()
  @x.Text("姓名图像名称")
  @x.Type("file")
  姓名图像名称: string;

  @x.Param()
  @x.Text("姓名框图片宽度")
  姓名框图片宽度: number = 200;

  @x.Param()
  @x.Text("姓名框图片高度")
  姓名框图片高度: number = 52;

  @x.Param()
  @x.Text("姓名框图片的X")
  姓名框图片的X: number;

  @x.Param()
  @x.Text("姓名框图片的Y")
  姓名框图片的Y: number;

  @x.Param()
  @x.Text("姓名框x")
  姓名框x: number = 0;

  @x.Param()
  @x.Text("姓名框y")
  姓名框y: number = 0;
}
