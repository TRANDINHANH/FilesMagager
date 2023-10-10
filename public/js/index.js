const socket = io.connect('http://localhost:3005'); // Điều chỉnh địa chỉ máy chủ và cổng của bạn
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
    console.log('đây là id ws client'+socket.id)
    $.fn.zTree.init($("#treeDemo"), setting, zNodes);
});


uploader.on('start', function (fileInfo) {
    console.log(socket.id +' Bắt đầu tải lên', fileInfo);
});

uploader.on('stream', function (fileInfo) {
    console.log(socket.id +' Đang tải lên... đã gửi %d byte.', fileInfo.sent);
});

uploader.on('complete', function (fileInfo) {
    console.log(socket.id +' Tải lên hoàn tất', fileInfo);
    socket.emit('select-file', {
        year: '2023',
        month: '10',
        day: '11',
        pageNumber:'1'  
    });
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


function loadDataImages(dataSourceUrlImages) {
    $('#pagination-container').pagination({
        dataSource: `${dataSourceUrlImages}`,
        pageSize: 10,
        locator: 'images',
        autoHidePrevious: true,
        autoHideNext: true,
        totalNumberLocator: function (res) {
            return res.total;
        },
        afterPageOnClick: function (event, pageNumber) {
            var fomatDate = dataSourceUrlImages.split('/').slice(-3).join('/');
            loadDataPage(pageNumber, dataSourceUrlImages, fomatDate);
        }
    });
};

function loadDataPage(page, dataSourceUrlImages, formattedDate) {
    $.get(`${dataSourceUrlImages}?page=${page}`, function (data) {
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
function loadDataImages1(dataSourceImages) {
    $('#pagination-container').pagination({
        dataSource: `${dataSourceImages}`,
        pageSize: 10,
        locator: 'images',
        autoHidePrevious: true,
        autoHideNext: true,
        totalNumber: dataSourceImages.total,
        afterPageOnClick: function (event, pageNumber) {
            socket.emit('select-file', {
                year: '2023',
                month: '10',
                day: '10',
                pageNumber:`${pageNumber}`  
            });
        }
    });
};

function loadDataPage1(data) {
    
        let imagesContainer = $('#images-container');
        imagesContainer.empty();
        for (let i = 0; i < data.images.length; i++) {
            const image = data.images[i];
            imagesContainer.append(`<div class="file-box" id="image-box">
                <div class="img-thumbnail-container">
        <img src="/get-image/2023/10/11/${image}" alt="${image}" class="img-thumbnail">
    </div>
                <div class="image-thumbnail">${image}</div>
            </div>`);
        }
}
function onTreeNodeClick(event, treeId, treeNode) {
    let path = treeNode.getPath();
    let formattedPath = path.map(node => node.name).join('/');
    // loadDataImages('/'+formattedPath);
    dataSourceUrlImages = '/'+formattedPath;
    var fomatDate = dataSourceUrlImages.split('/').slice(-3).join('/');
    loadDataImages(dataSourceUrlImages);
    loadDataPage(1, dataSourceUrlImages, fomatDate);
    
    console.log(formattedPath);
    console.log(path);
}
function initPageData(){
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1; // getMonth() trả về từ 0 (tháng 1) đến 11 (tháng 12), nên cần cộng thêm 1
    let day = today.getDate();
    let formattedDate = `${year}/${month}/${day}`;
    let dataSourceUrl = `/images/${formattedDate}`;

    loadDataImages(dataSourceUrl);
    loadDataPage(1,dataSourceUrl,formattedDate);
};
initPageData();
$('#btn-search').on('click',(function(){
    // loadDataImages('/images/2023/10/5');
    // loadDataPage(1,'/images/2023/10/5','2023/10/5');
    socket.emit('select-file', {
        year: '2023',
        month: '10',
        day: '11',
        pageNumber:'1'  
    });
}));
socket.on('select-file', (data) => { 
    console.log(data);
    loadDataImages1(data)
    loadDataPage1(data);
    $('#count-images').text('Tổng số: ' + data.total)
});