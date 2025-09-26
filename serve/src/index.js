
const express = require('express');
const cors = require('cors');
const { db } = require('./db');
const ASRWebSocketServer = require('./asrWebSocketServer');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());


//test api
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello Node serve!' });
});


// 路由挂载
// 挂载qiniu路由
const qiniuRouter = require('./routes/qiniuRoutes');
app.use('/api/qiniu', qiniuRouter);

// 挂载historicalFigures路由
const historicalFiguresRouter = require('./routes/historicalFigureRoutes');
app.use('/api/historicalFigures', historicalFiguresRouter);


// node serve 启动
app.listen(port, () => {
  console.log(`Serve backend running at http://localhost:${port}`);
  console.log(`ASR WebSocket server running at ws://localhost:3001`);
});


// 启动WebSocket语音识别服务器
const asrWebSocketServer = new ASRWebSocketServer(3001);
asrWebSocketServer.start();
