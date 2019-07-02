/*global abaplint*/

// file selection
function FileSelectHandler(e) {

	// cancel event and hover styling
	FileDragHover(e);

	// fetch FileList object
	var files = e.target.files || e.dataTransfer.files;

	// process all File objects
	for (var i = 0, f; f = files[i]; i++) {
    ParseFile(f);
    break; // only first file
	}
}

// file drag hover
function FileDragHover(e) {
	e.stopPropagation();
	e.preventDefault();
	e.target.className = (e.type == "dragover" ? "hover" : "");
}

function ParseFile(file) {
	var reader = new FileReader();
	reader.onload = function(e) {
    JSZip.loadAsync(e.target.result).then(function (zip) {
      console.log("hello world");
      console.log(zip);
  });
	}
	reader.readAsArrayBuffer(file);
}

// initialize
function Init() {

	var fileselect = document.getElementById("fileselect"), filedrag = document
			.getElementById("filedrag"), submitbutton = document
			.getElementById("submitbutton");

	// file select
	fileselect.addEventListener("change", FileSelectHandler, false);

	// is XHR2 available?
	var xhr = new XMLHttpRequest();
	if (xhr.upload) {
		// file drop
		filedrag.addEventListener("dragover", FileDragHover, false);
		filedrag.addEventListener("dragleave", FileDragHover, false);
		filedrag.addEventListener("drop", FileSelectHandler, false);
		filedrag.style.display = "block";

		// remove submit button
		submitbutton.style.display = "none";
	}
}

// call initialization file
if (window.File && window.FileList && window.FileReader) {
	Init();
}