const socket = io.connect('http://localhost:3005'); // Điều chỉnh địa chỉ máy chủ và cổng của bạn
var zTree;
var zNodes;
var setting = {
    data: {
        simpleData: {
            enable: true
        }
    }
};
    // Lắng nghe sự kiện từ máy chủ (ví dụ: khi tải lên hoàn thành)
    socket.on('uploadComplete', (message) => {
        alert(message); // Hiển thị thông báo khi tải lên hoàn thành
    });

    // Lắng nghe sự kiện để nhận dữ liệu từ máy chủ (ví dụ: danh sách tệp ảnh)
    socket.on('nodeList', (data) => {
        // Sử dụng dữ liệu để cập nhật giao diện người dùng (ví dụ: hiển thị danh sách tệp ảnh)
        zNodes = data;
        console.log(data); // In dữ liệu lên console để kiểm tra
        $.fn.zTree.init($("#treeDemo"), setting, zNodes);
    });

    // Hàm xử lý tải lên tệp tin
    function uploadFiles() {
        const fileInput = document.getElementById('fileimage');
        const formData = new FormData();
        for (const file of fileInput.files) {
            formData.append('files', file);
        }

        // Gửi yêu cầu tải lên đến máy chủ qua WebSocket
        socket.emit('uploadRequest', formData);

        // Xóa các tệp đã chọn để tải lên
        fileInput.value = '';
    }