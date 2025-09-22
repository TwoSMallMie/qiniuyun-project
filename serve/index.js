
const express = require('express');
const cors = require('cors');
const { db } = require('./db');
const userController = require('./controller/userController');
const qiniuController = require('./controller/qiniuController');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

//test api
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello Node serve!' });
});


// 路由挂载
// 查询users表所有数据
app.get('/api/users', userController.getUsers);


// 获取七牛云可用的模型
app.get('/api/qiniu/model', qiniuController.getModel);


// 进行七牛云模型推理api
app.post('/api/qiniu/chat', qiniuController.chatModel);

// 七牛云模型推理API - 流式输出
app.post('/api/qiniu/chat-stream', qiniuController.chatStreamModel);



// node serve 启动
app.listen(port, () => {
  console.log(`Serve backend running at http://localhost:${port}`);
});
