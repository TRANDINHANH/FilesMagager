var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var SocketIOFile = require('socket.io-file');
const fs = require('fs');
const path = require('path');
const express = require('express');

const port = 3005;

function getDirectoryStructure(dirPath, nodeName) {
    let structure = { name: nodeName, children: [] };
    let files = fs.readdirSync(dirPath);

    files.forEach(file => {
        let fullPath = path.join(dirPath, file);
        let stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            structure.children.push(getDirectoryStructure(fullPath, file));
        }
    });

    return structure;
}
let treeStructure = getDirectoryStructure('./file_uploads/images', 'images');
function saveTreeStructure() {
    fs.writeFile('./file_uploads/tree_node_list.json', JSON.stringify(treeStructure), 'utf8', (err) => {
        if (err) {
            console.error('Lỗi khi ghi tệp JSON:', err);
        }
    });
}
const filePathTreeNode = './file_uploads/tree_node_list.json';


let nodeList = null;

fs.readFile(filePathTreeNode, 'utf8', (err, data) => {
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
app.use('/get-image', express.static('file_uploads/images'));

app.get('/', (req, res) => {
    saveTreeStructure();
    res.sendFile(__dirname + '/public/views/index.html');
});

app.get('/images/:year/:month/:day', (req, res) => {
    let dirPath = path.join('./file_uploads/images', req.params.year, req.params.month, req.params.day);
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            res.status(500).send('Lỗi khi đọc thư mục');
            return;
        }

        // Lọc ra các file ảnh
        let imageFiles = files.filter(file => {
            let fullPath = path.join(dirPath, file);
            let stats = fs.statSync(fullPath);
            return !stats.isDirectory() && ['.jpg', '.jpeg', '.png', '.gif'].includes(path.extname(file).toLowerCase());
        });

        // Phân trang
        let page = parseInt(req.query.page) || 1;
        let pageSize = 10;
        let paginatedFiles = imageFiles.slice((page - 1) * pageSize, page * pageSize);

        res.json({
            total: imageFiles.length,
            images: paginatedFiles
        });
    });
});

// app.get('/get-image/:filename', (req, res) => {
//     let imagePath = 'file_uploads/images/' + req.params.filename;
//     readFile(imagePath, (err, data) => {
//         if (err) {
//             res.status(500).send('Lỗi khi đọc tệp ảnh');
//             console.error(err);
//             return;
//         }

//         res.writeHead(200, { 'Content-Type': 'image/jpeg, image/jpg, image/png, image/gif' });
//         res.end(data);
//     });
// });


// Xử lý tải lên
io.on('connection', (socket) => {
    console.log('Socket connected.');
    console.log(treeStructure);
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
