const socket = io.connect('http://localhost:3005');
socket.on('connect', () => {
    // Lấy socket.id của client
    const clientId = socket.id;
    console.log('Socket ID của client là:', clientId);
    sessionStorage.setItem('clientId', clientId);
    console.log('Socket session ID của client là:', sessionStorage.getItem('clientId'));
});

$('#button-open-image-manager').click(function () { 
    
    
    openImageManager()
});
function openImageManager() {
    let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
    width=1200,height=800,left=100,top=100`;
    
        open('index.html', 'test', params);  
}
socket.on('get-image-to-primary', (data) => {
    console.log(data);
    $('#image-preview').attr('src', data);
});