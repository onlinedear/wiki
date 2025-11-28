#!/bin/bash
###
 # @creator: "${author}"
 # @created: "${createTime}"
 # @last_modified_by: "${author}"
 # @last_modified: "${updateTime}"
 # @version: "v1.0"
 # @visibility: "internal"
### 

# 本地构建并推送到服务器的脚本
# 使用方法：
# 1. 在本地 Mac 上运行此脚本构建镜像
# 2. 将镜像保存为文件
# 3. 上传到服务器并加载

echo "开始构建 Docker 镜像（AMD64 架构，适用于服务器）..."

# 构建 AMD64 架构的镜像（适用于 x86_64 服务器）
docker build --platform linux/amd64 -t notedoc:latest .

if [ $? -ne 0 ]; then
    echo "构建失败！"
    exit 1
fi

echo "构建成功！"

# 保存镜像为 tar 文件
echo "正在保存镜像到文件..."
docker save -o notedoc-latest.tar notedoc:latest

if [ $? -ne 0 ]; then
    echo "保存失败！"
    exit 1
fi

echo "镜像已保存到 notedoc-latest.tar"
echo "文件大小："
ls -lh notedoc-latest.tar

echo ""
echo "下一步操作："
echo "1. 将 notedoc-latest.tar 上传到服务器"
echo "2. 在服务器上运行: docker load -i notedoc-latest.tar"
echo "3. 运行: docker-compose up -d"
