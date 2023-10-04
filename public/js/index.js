const socket = io.connect('http://localhost:3005'); // Điều chỉnh địa chỉ máy chủ và cổng của bạn
var uploader = new SocketIOFileClient(socket);

var zTree;
var zNodes;
var setting = {
    data: {
        simpleData: {
            enable: true
        }
    }
};


    // Lắng nghe sự kiện để nhận dữ liệu từ máy chủ (ví dụ: danh sách tệp ảnh)
    socket.on('nodeList', (data) => {
        // Sử dụng dữ liệu để cập nhật giao diện người dùng (ví dụ: hiển thị danh sách tệp ảnh)
        zNodes = data;
        console.log(data); // In dữ liệu lên console để kiểm tra
        $.fn.zTree.init($("#treeDemo"), setting, zNodes);
    });

    uploader.on('start', function(fileInfo) {
        console.log('Bắt đầu tải lên', fileInfo);
    });

    uploader.on('stream', function(fileInfo) {
        console.log('Đang tải lên... đã gửi %d byte.', fileInfo.sent);
    });

    uploader.on('complete', function(fileInfo) {
        console.log('Tải lên hoàn tất', fileInfo);
    });

    uploader.on('error', function(err) {
        console.log('Lỗi!', err);
    });

    uploader.on('abort', function(fileInfo) {
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