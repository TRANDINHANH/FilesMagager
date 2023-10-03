const express = require('express')
const fs = require('fs');
const app = express()
const port = 3000
const filePath = './file_uploads/tree_node_list.json';

let nodeList = null; // Khai báo biến nodeList ở mức global

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Lỗi khi đọc tệp JSON:', err);
        return;
    }

    try {
        // Chuyển đổi nội dung tệp JSON thành một đối tượng JavaScript
        nodeList = JSON.parse(data);
    } catch (parseError) {
        console.error('Lỗi khi phân tích tệp JSON:', parseError);
    }
});
app.use(express.static('public'));
app.use(express.static('node_modules'));
app.get('/', (req, res) => {
    // // Kiểm tra xem biến nodeList đã được nạp từ tệp JSON chưa
    // if (nodeList) {
    //     // Sử dụng biến nodeList để hiển thị dữ liệu trên trang web
    //     const html = `<h1>Dữ liệu từ tệp JSON:</h1>
    //                  <pre>${JSON.stringify(nodeList, null, 2)}</pre>`;
    //     res.send(html);
    // } else {
    //     res.send("<h1>Không có dữ liệu để hiển thị.</h1>");
    // }
    res.sendFile(__dirname + '/public/views/index.html');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});