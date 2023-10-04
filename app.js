var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var SocketIOFile = require('socket.io-file');
const fs = require('fs');

const express = require('express');

const port = 3005;


const filePath = './file_uploads/tree_node_list.json';

let nodeList = null;

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



app.use(express.static('node_modules'));
app.use(express.static('zTree_v3-master'));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/views/index.html');
});


// Xử lý tải lên
io.on('connection', (socket) => {
    console.log('Socket connected.');
    if (nodeList) {
        socket.emit('nodeList', nodeList);
    }
    var uploader = new SocketIOFile(socket, {
        uploadDir: 'file_uploads/images/' + (new Date()).getFullYear() + '/' + ((new Date()).getMonth() + 1) + '/' + (new Date()).getDate(), // đường dẫn đến thư mục bạn muốn tải tệp lên
        accepts: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg',], // định dạng tệp được chấp nhận
        maxFileSize: 4194304, // 4 MB. giới hạn kích thước tệp tối đa
        chunkSize: 10240, //10 KB. kích thước mỗi mảnh tệp
        transmissionDelay: 0,
        overwrite: true // ghi đè tệp nếu tên tệp đã tồn tại
    });

    uploader.on('start', (fileInfo) => {
        console.log('Start uploading');
        console.log(fileInfo);
    });

    uploader.on('stream', (fileInfo) => {
        console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
    });

    uploader.on('complete', (fileInfo) => {
        console.log('Upload Complete.');
        console.log(fileInfo);
        console.log(fileInfo.data.upload_year);
        console.log(fileInfo.data.upload_month);
        console.log(fileInfo.data.upload_day);
        console.log(fileInfo.data.upload_time);
    });

    uploader.on('error', (err) => {
        console.log('Error!', err);
    });

    uploader.on('abort', (fileInfo) => {
        console.log('Aborted: ', fileInfo);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
