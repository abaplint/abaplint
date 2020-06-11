/* eslint-disable @typescript-eslint/explicit-member-accessibility */
let json = {};

function focusFilter() {
  document.getElementById("filter").select();
}

function inputChanged() {
  renderRight(document.getElementById("filter").value);
  const value = document.getElementById("filter").value;
  let newUrl = window.location.pathname;
  if (value !== "") {
    newUrl = newUrl + "?filter=" + document.getElementById("filter").value;
  }
  window.history.replaceState(null, document.title, newUrl);
}

function setFilter(filter) {
  document.getElementById("filter").value = filter;
  renderRight(filter);
}

function renderSidenavList(list) {
  let html = "";
  for(const i of list) {
    html = html + "<a href=\"javascript:setFilter('" + i.name + "');\">" + i.name + "</a><br>";
  }

  return html;
}

function renderLeft() {
  document.getElementById("sidenav_statements").innerHTML = renderSidenavList(json.statements);
  document.getElementById("sidenav_expressions").innerHTML = renderSidenavList(json.expressions);
  document.getElementById("sidenav_structures").innerHTML = renderSidenavList(json.structures);
}

function renderList(filter, list) {
  let ret = "";
  for(const i of list) {
    if (!filter || i.name.toLowerCase().includes(filter.toLowerCase())) {
      ret = ret + "<div style=\"page-break-inside:avoid;\">" +
        "<u>" + i.name + "</u><br>" +
        "<a href=\"#/" + i.type + "/" + i.name + "\"><img src=\"" + i.type + "_" + i.name + ".svg\"></a></div><br>";
    }
  }
  return ret;
}

function renderRight(filter) {
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

function renderSyntax(type, name) {
  // lookup
  let found = {};
  let prev = {};
  let next = {};
  const list = json[type + "s"];
  for(let index = 0; index < list.length; index++) {
    if (list[index].name === name) {
      found = list[index];
      prev = list[index - 1];
      next = list[index + 1];
      break;
    }
  }
  if (found.using === undefined) {
    document.getElementById("body").innerHTML = "404";
    return;
  }

  let html = "<h1>" + type + ": " + name + "</h1>\n";

  html = html + "<a href=\"#\">Home</a><br>\n";
  if (prev) {
    html = html + "<b>Prev</b>: <a href=\"#/" + type + "/" + prev.name + "\">" + prev.name + "</a><br>\n";
  }
  if (next) {
    html = html + "<b>Next</b>: <a href=\"#/" + type + "/" + next.name + "\">" + next.name + "</a><br>\n";
  }

// html = html + "<a href=\"https://github.com/abaplint/abaplint/blob/master/src/packages/core/abap/" +
// found.type + "s/" + found.filename + "\">Source</a><br>";

  const use = found.using.map((e) => { return "<a href=\"#/" + e + "\">" + e + "</a>"; });
  const by = found.used_by.map((e) => { return "<a href=\"#/" + e + "\">" + e + "</a>"; });

  html = html + found.svg + "<br>\n" +
    "<b>Using</b>: " + use.join(", ") + "<br>\n" +
    "<b>Used by</b>: " + by.join(", ") + "<br>\n";

  document.getElementById("body").innerHTML = html;
}

class Router {
  static popstate() {
    if(window.location.hash === "") {
      renderMain();
    } else {
      const split = window.location.hash.split("/");
      renderSyntax(split[1], split[2]);
    }
  }
}

function onRightClick() {
  document.getElementById("filter").value = "";
  inputChanged();
  window.event.returnValue = false;
}

function renderMain() {
  let filter = new URL(window.location).searchParams.get("filter");
  if (filter === null) {
    filter = "";
  }

  document.getElementById("body").innerHTML =
    "<div>\n" +
    "<div id=\"mySidenav\" class=\"sidenav sidenav-print\">\n" +
    "<h3>abaplint</h3>\n" +
    "<input type=\"text\" id=\"filter\" oninput=\"javascript:inputChanged();\" onfocus=\"javascript:focusFilter()\" oncontextmenu=\"javascript:onRightClick();\" value=\"" + filter + "\"></input><br>\n" +
    "<br>\n" +
    "<b>Statements</b><br>\n" +
    "<div id=\"sidenav_statements\">Loading</div>\n" +
    "<br>\n" +
    "<b>Expressions</b><br>\n" +
    "<div id=\"sidenav_expressions\">Loading</div>\n" +
    "<br>\n" +
    "<b>Structures</b><br>\n" +
    "<div id=\"sidenav_structures\">Loading</div>\n" +
    "</div>\n" +
    "<div id=\"main\" class=\"main main-print\">Loading</div>";

  document.getElementById("filter").focus();
  renderLeft();
  inputChanged();
}

function run() {
  window.onpopstate = Router.popstate;
  json = data;
  Router.popstate();
}

run();