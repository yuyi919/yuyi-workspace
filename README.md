# yuyi-workspace

# rush publish的坑
由于rush publish 默认发布流程不会读取用户目录下的.npmrc
需要手动设置publish-token，位置如下
./common/config/rush/.npmrc-publish
