
const express = require('express');
const cors = require('cors');
<<<<<<< HEAD
const mysql = require('mysql');
=======
const { db } = require('./db');
const userController = require('./controller/userController');
const qiniuController = require('./controller/qiniuController');
>>>>>>> master
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

<<<<<<< HEAD
// 创建 MySQL 连接
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456', // 请根据实际情况修改
  database: 'testdb'   // 请确保已创建 testdb 数据库
});

db.connect((err) => {
  if (err) {
    console.error('数据库连接失败:', err);
  } else {
    console.log('数据库连接成功');
  }
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from serve backend!' });
});

// 示例：查询数据库
app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      return res.status(500).json({ error: '数据库查询失败' });
    }
    console.log(results);
    
    res.json(results);
  });
});

=======
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
>>>>>>> master
app.listen(port, () => {
  console.log(`Serve backend running at http://localhost:${port}`);
});
