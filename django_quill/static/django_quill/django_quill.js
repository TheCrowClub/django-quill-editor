Quill.register("modules/imageCompressor", imageCompressor);
Quill.register("modules/resize", window.QuillResizeModule);

class QuillWrapper {
    constructor(targetDivId, targetInputId, quillOptions) {
        this.targetDiv = document.getElementById(targetDivId);
        if (!this.targetDiv) throw 'Target div(' + targetDivId + ') id was invalid';

        this.targetInput = document.getElementById(targetInputId);
        if (!this.targetInput) throw 'Target Input id was invalid';

        this.quill = new Quill('#' + targetDivId, quillOptions);
        this.quill.on('text-change', () => {
            var delta = JSON.stringify(this.quill.getContents());
            var html = this.targetDiv.getElementsByClassName('ql-editor')[0].innerHTML;
            var data = {delta: delta, html: html};
            this.targetInput.value = JSON.stringify(data);
        });
        this.quill.getModule('toolbar').addHandler('image', () => {
            selectLocalImage();
          });
    }
}


function selectLocalImage() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('multiple', 'multiple');
    input.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/webp')
    input.click();
  
    // Listen upload local image and save to server
    input.onchange = () => {
      const fileList = Array.from(input.files);
      saveToServer(fileList);
    }
  }
    
  function saveToServer(files) {
    const formData = new FormData();
    files.forEach(file => formData.append('images[]', file));

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '//' + window.location.host + '/upload/image', true);
    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText).data;
        data.forEach(url => insertToEditor(url));
      }
    };
    xhr.send(formData);
  }
  
  function insertToEditor(url) {
    // push image url to rich editor.
    const range = quill.getSelection();
    quill.insertEmbed(range.index, 'image', url);
  }  
