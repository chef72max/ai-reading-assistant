#!/bin/bash

echo "🚀 启动AI阅读助手..."
echo "📚 正在检查依赖..."

# 检查node_modules是否存在
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖中..."
    npm install
fi

echo "🌟 启动开发服务器..."
echo "🌐 应用将在 http://localhost:3000 上运行"
echo "📱 按 Ctrl+C 停止服务器"

npm run dev
