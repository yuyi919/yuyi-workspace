# yuyi-workspace

# rush publish 的坑

由于 rush publish 默认发布流程不会读取用户目录下的.npmrc
需要手动设置 publish-token，位置如下
./common/config/rush/.npmrc-publish

# rush 增量构建

开启见https://github.com/microsoft/rushstack/issues/2300#issuecomment-1012622369
rush -o 标识符下无效，必须得有--to 或类似或无目标选定的标志
