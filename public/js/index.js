const socket = io('http://localhost:3005'); // Điều chỉnh địa chỉ máy chủ và cổng của bạn
var uploader = new SocketIOFileClient(socket);

var zTree;
var zNodes;
var setting = {
    data: {
        simpleData: {
            enable: true
        }
    },
    callback: {
        onClick: onTreeNodeClick
    }
};


// Lắng nghe sự kiện để nhận dữ liệu từ máy chủ (ví dụ: danh sách tệp ảnh)
socket.on('nodeList', (data) => {
    // Sử dụng dữ liệu để cập nhật giao diện người dùng (ví dụ: hiển thị danh sách tệp ảnh)
    zNodes = data;
    console.log(data); // In dữ liệu lên console để kiểm tra
    $.fn.zTree.init($("#treeDemo"), setting, zNodes);
});

uploader.on('start', function (fileInfo) {
    console.log('Bắt đầu tải lên', fileInfo);
});

uploader.on('stream', function (fileInfo) {
    console.log('Đang tải lên... đã gửi %d byte.', fileInfo.sent);
});

uploader.on('complete', function (fileInfo) {
    console.log('Tải lên hoàn tất', fileInfo);
});

uploader.on('error', function (err) {
    console.log('Lỗi!', err);
});

uploader.on('abort', function (fileInfo) {
    console.log('Đã hủy: ', fileInfo);
});

function uploadFiles() {
    var fileEl = document.getElementById('fileimage');
    uploader.upload(fileEl, {
        data: {
            upload_year: (new Date()).getFullYear(),
            upload_month: (new Date()).getMonth() + 1,
            upload_day: (new Date()).getDate(),
            upload_time: (new Date()).getHours() + ':' + (new Date()).getMinutes() + ':' + (new Date()).getSeconds(),
            upload_dir: (new Date()).getFullYear() + '/' + ((new Date()).getMonth() + 1) + '/' + (new Date()).getDate()
        }
    });
};
// $('#pages').pagination({
//     dataSource: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 35],
//     pageSize: 10,
//     autoHidePrevious: true,
//     autoHideNext: true,
//     totalNumberLocator: function(res) {
//         return Math.floor(Math.random() * (1000 - 100)) + 100;
//     },
//     apterPageOnClick: function(event, pageNumber) {
//         console.log(pageNumber);
//     }
// })

// function loadPage(page){
//     $('#image-box').html('');
//     $.ajax({
//         url: '/2023-10-5?page=' + page,
//         method: 'GET',
//         success: function(res){
//             console.log(res);
//             res.images.forEach(image => {
//                 $('#image-box').append(`<img src="/${image}" alt="${image}" class="img-thumbnail">`);
//             });
//         },
//         error: function(err){
//             console.log(err);
//         }
//     });
// }
let today = new Date();
let year = today.getFullYear();
let month = today.getMonth() + 1; // getMonth() trả về từ 0 (tháng 1) đến 11 (tháng 12), nên cần cộng thêm 1
let day = today.getDate();
let formattedDate = `${year}/${month}/${day}`;
formattedDate = "2023/10/5"
$('#pagination-container').pagination({
    dataSource: `/images/${formattedDate}`,
    pageSize: 10,
    locator: 'images',
    autoHidePrevious: true,
    autoHideNext: true,
    totalNumberLocator: function (res) {
        return res.total;
    },
    afterPageOnClick: function (event, pageNumber) {
        loadData(pageNumber);
    }
});
function loadData(page) {
    $.get(`/images/${formattedDate}?page=${page}`, function (data) {
        let imagesContainer = $('#images-container');
        imagesContainer.empty();
        for (let i = 0; i < data.images.length; i++) {
            const image = data.images[i];
            imagesContainer.append(`<div class="file-box" id="image-box">
                <div class="img-thumbnail-container">
        <img src="/get-image/${formattedDate}/${image}" alt="${image}" class="img-thumbnail">
    </div>
                <div class="image-thumbnail">${image}</div>
            </div>`);
        }


    });
}

loadData(1);
function onTreeNodeClick(event, treeId, treeNode) {
    let path = treeNode.getPath();
    let formattedPath = path.map(node => node.name).join('/');
    console.log(formattedPath);
    console.log(path);
}