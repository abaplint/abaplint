let json = {};

function focusFilter() {
  document.getElementById("filter").select();
}

function inputChanged() {
  renderMain(document.getElementById('filter').value);
}

function setFilter(filter) {
  document.getElementById('filter').value = filter;
  renderMain(filter);
}

function renderSidenavList(list) {
  let html = "";
  for(let i of list) {
    let str = i.split("_")[1];
    html = html + "<a href=\"javascript:setFilter('" + str + "');\">" + str + "</a><br>";
  }

  return html;
}

function renderSidenav() {
  document.getElementById("sidenav_statements").innerHTML = renderSidenavList(json.statements);
  document.getElementById("sidenav_expressions").innerHTML = renderSidenavList(json.expressions);
  document.getElementById("sidenav_structures").innerHTML = renderSidenavList(json.structures);
}

function renderList(filter, list) {

  let ret = "";
  for(let i of list) {
    if (!filter || i.toLowerCase().includes(filter.toLowerCase())) {
      ret = ret + "<div style=\"page-break-inside:avoid;\">" +
        "<u>" + i.split("_")[1] + "</u><br>" +
        "<a href=\"" + i + ".svg\"><img src=\"" + i + ".svg\"></a></div><br>";
    }
  }
  return ret;

}

function renderMain(filter) {
  let html = "";

  const statements = renderList(filter, json.statements);
  if (statements !== "") {
    html = "<div style=\"page-break-before: always;\"><h1>Statements</h1>" + statements + "</div>";
  }

  const expressions = renderList(filter, json.expressions);
  if (expressions !== "") {
    html = html + "<div style=\"page-break-before: always;\"><h1>Expressions</h1>" + expressions + "</div>";
  }

  const structures = renderList(filter, json.structures);
  if (structures !== "") {
    html = html + "<div style=\"page-break-before: always;\"><h1>Structures</h1>" + structures + "</div>";
  }

  document.getElementById("main").innerHTML = html;
}

function render() {
  renderSidenav();
  renderMain();
}

function handler(evt) {
  if (evt.target.status === 200) {
    json = JSON.parse(evt.target.responseText);
    render();
  } else {
    alert("REST call failed, status: " + evt.target.status);
  }
}

function run() {
  document.getElementById("filter").focus();

  let oReq = new XMLHttpRequest();
  oReq.addEventListener("load", handler);
  oReq.open("GET", "./data.json");
  oReq.send();
}

run();