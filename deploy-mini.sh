#!/bin/bash
# EnglishStudy 极简部署 - 第1步：下载代码
set -e
cd /opt && rm -rf english-study && mkdir english-study && cd english-study

# 直接从 GitHub 下载最新代码
curl -L https://github.com/ericacx/EnglishStudy/archive/refs/heads/main.tar.gz -o code.tar.gz
tar -xzf code.tar.gz --strip-components=1
rm code.tar.gz

cd server
npm install
npm run build

npm install -g pm2
pm2 delete english-study 2>/dev/null || true
pm2 start dist/index.js --name english-study
pm2 save
pm2 startup

echo "✅ 部署完成! 访问: http://139.59.97.154:23740/api/health"
