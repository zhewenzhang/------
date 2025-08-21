const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// 设置静态文件目录
app.use(express.static('.'));

// 处理所有路由，返回相应的HTML文件
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/aurora', (req, res) => {
  res.sendFile(path.join(__dirname, 'index-aurora.html'));
});

app.get('/daily-summary', (req, res) => {
  res.sendFile(path.join(__dirname, 'daily-summary.html'));
});

app.get('/world-events', (req, res) => {
  res.sendFile(path.join(__dirname, 'world-events.html'));
});

// 404处理
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});