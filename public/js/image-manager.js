$('#button-open-image-manager').click(function () { 
    openImageManager()
});
function openImageManager() {
    let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
    width=1200,height=800,left=100,top=100`;
    
        open('http://localhost:3005', 'test', params);  
}