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
      var data = { delta: delta, html: html };
      this.targetInput.value = JSON.stringify(data);
    });
    this.quill.getModule('toolbar').addHandler('image', () => {
      this.selectLocalImage();
    });
  }

  selectLocalImage() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('multiple', 'multiple');
    input.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/webp');
    input.click();

    // Listen upload local image and save to server
    input.onchange = () => {
      const fileList = Array.from(input.files);
      this.saveToServer(fileList);
    }
  }

  saveToServer(files) {
    console.log(files)
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '//' + window.location.host + '/upload/image', true);
    var csrfToken = document.querySelector('input[name=csrfmiddlewaretoken]').value;
    xhr.setRequestHeader('X-CSRFToken', csrfToken);
    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText).data;
        data.forEach(url => this.insertToEditor(url));
      }
    };
    xhr.send(formData);
  }

  insertToEditor(url) {
    // push image url to rich editor.
    const range = this.quill.getSelection();
    this.quill.insertEmbed(range.index, 'image', url);
  }
}

// Example usage
// const quillWrapper = new QuillWrapper('editor', 'input', /* your quill options */);
