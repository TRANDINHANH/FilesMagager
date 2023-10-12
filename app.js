var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server,{
    cors: {
    origin: "*",
    methods: ["GET", "POST"],
    transports: ['websocket', 'polling'],
    credentials: true
    },
    allowEIO3: true
    });
var SocketIOFile = require('socket.io-file');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const port = 3005;

function getDirectoryStructure(dirPath, nodeName) {
    let structure = { name: nodeName, open: true, children: [] };
    let files = fs.readdirSync(dirPath);

    // Lấy ngày hiện tại
    let today = new Date();
    let dirName = `file_uploads\\images`;
    let formattedTodaydir = `${dirName}\\${today.getFullYear()}\\${today.getMonth() + 1}\\${today.getDate()}`;
    let formattedYearNowdir = `${dirName}\\${today.getFullYear()}`;
    let formattedYearAndMonthNowdir = `${dirName}\\${today.getFullYear()}\\${today.getMonth() + 1}`;
    let link = `images/${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`

    files.forEach(file => {
        let fullPath = path.join(dirPath, file);
        let stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            let childStructure = getDirectoryStructure(fullPath, file);

            // Kiểm tra xem ngày hiện tại có trùng với ngày trong đường dẫn không
            if (fullPath.localeCompare(formattedTodaydir)== 0 || fullPath.localeCompare(formattedYearNowdir)== 0 || fullPath.localeCompare(formattedYearAndMonthNowdir) == 0 ||fullPath.localeCompare(dirName) == 0) {
                childStructure.open = true;               
            }

            structure.children.push(childStructure);
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


app.use(cors());
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

app.get('/search/:year/:month/:day', (req, res) => {
    let imageName = req.query.name.toLowerCase();
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let pageSize = 10;
    let dirPath = path.join('./file_uploads/images', req.params.year, req.params.month, req.params.day);

    fs.readdir(dirPath, (err, files) => {
        if (err) {
            res.status(500).send('Lỗi khi đọc thư mục');
            return;
        }

        // let matchingFiles = files.filter(file => file.includes(imageName)); // Tìm kiếm có phân biệt chữ hoa chữ thường
        let matchingFiles = files.filter(file => file.toLowerCase().includes(imageName));// Tìm kiếm không phân biệt chữ hoa chữ thường
        let paginatedFiles = matchingFiles.slice((page - 1) * pageSize, page * pageSize);

        res.json({
            total: matchingFiles.length,
            images: paginatedFiles
        });
    });
});

function GetImages(year, month, day, pageNumber, callback) {
    let dirPath = path.join('./file_uploads/images', year, month, day);
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            // Gọi callback với lỗi nếu có lỗi
            callback(err, null);
            return;
        }

        // Lọc ra các file ảnh
        let imageFiles = files.filter(file => {
            let fullPath = path.join(dirPath, file);
            let stats = fs.statSync(fullPath);
            return !stats.isDirectory() && ['.jpg', '.jpeg', '.png', '.gif'].includes(path.extname(file).toLowerCase());
        });

        // Phân trang
        let page = parseInt(pageNumber) || 1;
        let pageSize = 10;
        let paginatedFiles = imageFiles.slice((page - 1) * pageSize, page * pageSize);

        // Gọi callback với kết quả
        callback(null, {
            total: imageFiles.length,
            images: paginatedFiles
        });
    });
}

// Xử lý tải lên
io.on('connection', (socket) => {
    console.log('Socket connected. ' + socket.id);
    console.log(treeStructure);
    if (nodeList) {
        io.sockets.emit('nodeList', nodeList);
    }
    var uploader = new SocketIOFile(socket, {
        uploadDir: 'file_uploads/images/' + (new Date()).getFullYear() + '/' + ((new Date()).getMonth() + 1) + '/' + (new Date()).getDate(), // đường dẫn đến thư mục bạn muốn tải tệp lên
        accepts: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg',], // định dạng tệp được chấp nhận
        maxFileSize: 4194304, // 4 MB. giới hạn kích thước tệp tối đa
        chunkSize: 10240, //10 KB. kích thước mỗi mảnh tệp
        transmissionDelay: 0,
        overwrite: true // ghi đè tệp nếu tên tệp đã tồn tại
    });

    var uploadCount = 0; // Thêm biến để theo dõi số lượng tệp đang được tải lên

    uploader.on('start', (fileInfo) => {
        console.log('Start uploading ' + socket.id);
        console.log(fileInfo);
        uploadCount++; // Tăng số lượng tệp đang được tải lên khi bắt đầu tải lên một tệp mới
    });

    uploader.on('complete', (fileInfo) => {
        console.log('Upload Complete.' + socket.id + ' ' + fileInfo.name);
        uploadCount--; // Giảm số lượng tệp đang được tải lên khi hoàn tất tải lên một tệp

        // Chỉ gửi sự kiện upload-complete khi không còn tệp nào đang được tải lên
        if (uploadCount === 0) {
            socket.emit('upload-complete',fileInfo);
        }
    });

    uploader.on('error', (err) => {
        console.log('Error!', err);
        uploadCount--; // Giảm số lượng tệp đang được tải lên nếu có lỗi khi tải lên một tệp
    });

    uploader.on('abort', (fileInfo) => {
        console.log('Aborted: ', fileInfo);
        uploadCount--; // Giảm số lượng tệp đang được tải lên nếu hủy tải lên một tệp
    });

    socket.on('select-file', (data) => {
        console.log('select-file: '+ data.year +data.month + data.day + data.pageNumber);    
        GetImages(data.year, data.month, data.day, data.pageNumber, (err, result) => {
            if (err) {
                console.error('Lỗi:', err);
            } else {
                socket.emit('select-file', result);
            }
        }); 
    });
});

server.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
