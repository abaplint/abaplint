/*global abaplint*/

let registry = undefined;
let result = undefined;

// file selection
async function FileSelectHandler(e) {

	// cancel event and hover styling
	FileDragHover(e);

	// fetch FileList object
	var files = e.target.files || e.dataTransfer.files;

	// process all File objects
	for (var i = 0, f; f = files[i]; i++) {
    await unzipFile(f);
    break; // only first file
	}
}

// file drag hover
function FileDragHover(e) {
	e.stopPropagation();
	e.preventDefault();
	e.target.className = (e.type == "dragover" ? "hover" : "");
}

async function loadZip(zip) {
  registry = new abaplint.Registry();
  document.getElementById("results").innerHTML = "";
  for (const f in zip.files) {
    if (f.dir === true) {
      continue;
    }
    document.getElementById("status").innerHTML = "unzip: " + f;
    const contents = await zip.files[f].async("string");
    registry.addFile(new abaplint.File(f, contents));
  }
  zip = undefined; // make sure this can be garbage collected

  result = new abaplint.SemanticSearch(registry).run();
  document.getElementById("status").innerHTML = "Done";
  await popuplateDropdown();
}

function linkToExpression(name) {
  return "<a href=\"https://syntax.abaplint.org/#/expression/" + name + "\" target=\"_blank\">" + name + "</a>";
}

function escape(str) {
  str = str.replace(/&/g, "&amp;");
  str = str.replace(/>/g, "&gt;");
  str = str.replace(/</g, "&lt;");
  str = str.replace(/"/g, "&quot;");
  str = str.replace(/'/g, "&#039;");
  return str;
}

function changeDropdown(evt) {
  let html = "<br>" + linkToExpression(result.expressions[Number(evt.target.value)].key) + "<br><br>";

  for (const found of result.expressions[Number(evt.target.value)].found) {
    html = html + "<tt><b>" + escape(found.code) + "</b></tt><br>\n" +
      "<tt>" + result.files[found.file] + "</tt><br><tt>" + found.row + "</tt><br><br>\n";
  }
  document.getElementById("results").innerHTML = html;
}

async function popuplateDropdown() {
  let options = "";
  for (const i in result.expressions) {
    options = options + "<option value=\"" + i + "\">" +
      result.expressions[i].key + "(" + result.expressions[i].found.length + ")</option>\n";
  }
  document.getElementById("dropdown").innerHTML = options;
  document.getElementById("dropdown").onchange = changeDropdown;
}

async function unzipFile(file) {
	var reader = new FileReader();
	reader.onload = function(e) {
    JSZip.loadAsync(e.target.result).then(function (zip) {
      loadZip(zip);
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