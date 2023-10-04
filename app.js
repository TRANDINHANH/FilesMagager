const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const http = require('http'); // Thêm thư viện HTTP
const socketIo = require('socket.io'); // Thêm thư viện Socket.IO

const app = express();
const port = 3005;
const filePath = './file_uploads/tree_node_list.json';

let nodeList = null;

// Thêm server HTTP để sử dụng với Socket.IO
const server = http.createServer(app);
const io = socketIo(server);

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Lỗi khi đọc tệp JSON:', err);
        return;
    }

    try {
        nodeList = JSON.parse(data);
    } catch (parseError) {
        console.error('Lỗi khi phân tích tệp JSON:', parseError);
    }
});

// Cấu hình nơi lưu trữ tệp tải lên
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'file_uploads/images');
    },
    filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

app.use(express.static('node_modules'));
app.use(express.static('zTree_v3-master'));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/views/index.html');
});

// Sử dụng WebSocket để gửi dữ liệu từ máy chủ đến máy khách
io.on('connection', (socket) => {
    // Gửi dữ liệu từ biến nodeList khi có kết nối mới
    if (nodeList) {
        socket.emit('nodeList', nodeList);
    }
});

// Xử lý tải lên
app.post('/upload', upload.array('files', 10), (req, res) => {
    res.send('Files uploaded successfully');

    // Sau khi tải lên xong, gửi thông báo đến tất cả các máy khách sử dụng WebSocket
    io.emit('uploadComplete', 'Tệp đã được tải lên thành công.');
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
