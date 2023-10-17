const domain = 'http://localhost:3005';
const socket = io.connect(domain); // Điều chỉnh địa chỉ máy chủ và cổng của bạn
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

let todaycurrentVỉewGetInfo = new Date();
let currentViewGetInfo = {
    year: todaycurrentVỉewGetInfo.getFullYear(),
    month: todaycurrentVỉewGetInfo.getMonth() + 1,
    day: todaycurrentVỉewGetInfo.getDate(),
    pageNumber:'1'  
};
let chooseDateForSearch = null;

// Lắng nghe sự kiện để nhận dữ liệu từ máy chủ (ví dụ: danh sách tệp ảnh)
socket.on('nodeList', (data) => {
    // Sử dụng dữ liệu để cập nhật giao diện người dùng (ví dụ: hiển thị danh sách tệp ảnh)
    zNodes = data;
    console.log(data); // In dữ liệu lên console để kiểm tra
    $.fn.zTree.init($("#treeDemo"), setting, zNodes);
});

socket.on('connect', () => {
    // Lấy socket.id của client
    const clientId = socket.id;
    const primaryClientId = sessionStorage.getItem('clientId');
    socket.emit('primary-clientId', primaryClientId);
    console.log('Socket session ID của primaru client là:', primaryClientId);
});

uploader.on('start', function (fileInfo) {
    console.log(socket.id +' Bắt đầu tải lên', fileInfo);
});

uploader.on('stream', function (fileInfo) {
    console.log(socket.id +' Đang tải lên... đã gửi %d byte.', fileInfo.sent);
});

uploader.on('complete', function (fileInfo) {
    console.log(socket.id +' Tải lên hoàn tất', fileInfo);
    
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
        },
        afterPreviousOnClick: function (event, pageNumber) {
            var fomatDate = dataSourceUrlImages.split('/').slice(-3).join('/');
            loadDataPage(pageNumber, dataSourceUrlImages, fomatDate);
        },
        afterNextOnClick: function (event, pageNumber) {
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
        <img src="${domain}/get-image/${formattedDate}/${image}" alt="${image}" onclick="getImageToClient(event)" id="/get-image/${formattedDate}/${image}" class="img-thumbnail">
        <div class="image-thumbnail">${image}</div>
        </div>
                
            </div>`);
        }
    });
}
// function loadDataImages1(dataSourceImages) {
//     $('#pagination-container').pagination({
//         dataSource: `${dataSourceImages}`,
//         pageSize: 10,
//         locator: 'images',
//         autoHidePrevious: true,
//         autoHideNext: true,
//         totalNumber: dataSourceImages.total,
//         afterPageOnClick: function (event, pageNumber) {
//             socket.emit('select-file', {
//                 year: '2023',
//                 month: '10',
//                 day: '10',
//                 pageNumber:`${pageNumber}`  
//             });
//         },

//     });
// };

// function loadDataPage1(data) {
    
//         let imagesContainer = $('#images-container');
//         imagesContainer.empty();
//         for (let i = 0; i < data.images.length; i++) {
//             const image = data.images[i];
//             imagesContainer.append(`<div class="file-box" id="image-box">
//                 <div class="img-thumbnail-container">
//         <img src="/get-image/2023/10/11/${image}" alt="${image}" onclick="getImageToClient()" id="/get-image/${formattedDate}/${image}" class="img-thumbnail">
//     </div>
//                 <div class="image-thumbnail">${image}</div>
//             </div>`);
//         }
// }
function onTreeNodeClick(event, treeId, treeNode) {
    let path = treeNode.getPath();
    let formattedPath = path.map(node => node.name).join('/');
    // loadDataImages('/'+formattedPath);
    dataSourceUrlImages = '/'+formattedPath;
    var fomatDate = dataSourceUrlImages.split('/').slice(-3).join('/');
    loadDataImages(domain + dataSourceUrlImages);
    loadDataPage(1,domain + dataSourceUrlImages, fomatDate);
    chooseDateForSearch = formattedPath;
    console.log('ngày chọn '+formattedPath);
    console.log(path);
}

function initPageData(){
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    let formattedDate = `${year}/${month}/${day}`;
    let dataSourceUrl = `${domain}/images/${formattedDate}`;

    loadDataImages(dataSourceUrl);
    loadDataPage(1,dataSourceUrl,formattedDate);
};

function loadTotalImages(data) {
    if (data && data.total) {
        $('#count-images').text('Tổng số: ' + data.total);
    } else {
        console.error('Data không hợp lệ');
    }
}
initPageData();
// $('#btn-search').on('click',(function(){
//     // loadDataImages('/images/2023/10/5');
//     // loadDataPage(1,'/images/2023/10/5','2023/10/5');
//     socket.emit('select-file', {
//         year: '2023',
//         month: '10',
//         day: '11',
//         pageNumber:'1'  
//     });
// }));
// socket.on('select-file', (data) => { 
//     console.log(data);
//     loadDataImages1(data)
//     loadDataPage1(data);
//     loadTotalImages(data)
// });
socket.on('upload-complete', (data) => { 
    initPageData();
    // loadTotalImages(data)
    console.log(data);
});


function loadDataSearchImages(dataSourceUrlImages, searchName) {
    $('#pagination-container').pagination({
        dataSource: `${dataSourceUrlImages}?name=${searchName}`,
        pageSize: 10,
        locator: 'images',
        autoHidePrevious: true,
        autoHideNext: true,
        totalNumberLocator: function (res) {
            return res.total;
        },
    });
};
function loadDataSearchPage(page, dataSourceUrlImages, formattedDate, searchName) {
    $.get(`${dataSourceUrlImages}?page=${page}&name=${searchName}`, function (data) {
        let imagesContainer = $('#images-container');
        imagesContainer.empty();
        for (let i = 0; i < data.images.length; i++) {
            const image = data.images[i];
            imagesContainer.append(`<div class="file-box" id="image-box">
                <div class="img-thumbnail-container">
        <img src="${domain}/get-image/${formattedDate}/${image}" alt="${image}" onclick="getImageToClient(event)" id="/get-image/${formattedDate}/${image}" class="img-thumbnail">
        <div class="image-thumbnail">${image}</div>
    </div>
            </div>`);
        }
    });
}

$('#btn-search').on('click', function() {
    loadImagesSearch(chooseDateForSearch)
});
$('#search').on('keyup', function(e) {
    if (e.keyCode === 13) {
        loadImagesSearch(chooseDateForSearch)
    }
});
function loadImagesSearch(date) {
    let imageName = $('#search').val();
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    let dataSourceUrl = `${domain}/search/${year}/${month}/${day}`;
    if(date != null || date != undefined || date != ''){
        dataSourceUrl = `${domain}/search/${year}/${month}/${day}`;
    }
    loadDataSearchImages(dataSourceUrl, imageName);
    loadDataSearchPage(1,dataSourceUrl,`${year}/${month}/${day}`,imageName);
}

function getImageToClient(event) {
    let imgSrc = event.target.src;
    console.log(imgSrc);
    socket.emit('get-image-to-primary', imgSrc);
}
