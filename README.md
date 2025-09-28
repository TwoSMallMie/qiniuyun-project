# 七牛云项目 - 前后端运行说明
这是一个基于Vue.js前端和Node.js后端的全栈应用项目，集成了七牛云服务、语音识别、历史人物对话等功能。

## 项目结构
```
qiniuyun-project/
├── client/          # Vue.js 前端应用
├── serve/           # Node.js 后端服务
├── doc/             # 项目文档
└── README.md        # 项目说明
```

## 环境要求
- **Node.js**: >= 14.0.0
- **npm**: >= 6.0.0
- **浏览器**: Chrome, Firefox, Safari, Edge

## 快速启动
### 完整项目启动步骤
1. **克隆项目**
```bash
git clone <项目地址>
cd qiniuyun-project

```
2. **数据库配置**
```bash
mysql运行版本：8.0.31 
运行数据库初始化脚本：serve\src\sql\init_qiniuproject.sql
```

2. **启动后端服务**
```bash
cd serve
npm install
node index.js
```
3. **启动前端服务** (新开终端)
```bash
cd client
npm install
npm run serve
```

4. **访问应用**
打开浏览器访问: http://localhost:8080


## 响应式支持
- 桌面端: 1200px+
- 平板端: 700px - 1199px
- 手机端: < 700px

## 技术栈
### 前端
- **框架**: Vue.js 2.x
- **路由**: Vue Router 3.x
- **状态管理**: Vuex 3.x
- **构建工具**: Vue CLI 5.x
- **UI**: 自定义组件 + CSS3

### 后端
- **运行时**: Node.js
- **框架**: Express.js
- **数据库**: (根据配置)
- **WebSocket**: ws
- **语音和模型处理**: 七牛云服务
