/* eslint-disable no-eval */
"use strict";

// used for generating "syntax"

import Railroad from "railroad-diagrams";
import {writeFileSync, readFileSync} from "fs";

const folder = "./build/";

function generateSVG(input, language) {
  const css = "<defs>\n" +
  "<style type=\"text/css\"><![CDATA[\n" +
  "path {\n" +
  "stroke-width: 3;\n" +
  "stroke: black;\n" +
  "fill: rgba(0,0,0,0);\n" +
  "}\n" +
  "text {\n" +
  "font: bold 14px monospace;\n" +
  "text-anchor: middle;\n" +
  "}\n" +
  "text.diagram-text {\n" +
  "font-size: 12px;\n" +
  "}\n" +
  "a {\n" +
  "fill: blue;\n" +
  "}\n" +
  "text.diagram-arrow {\n" +
  "font-size: 16px;\n" +
  "}\n" +
  "text.label {\n" +
  "text-anchor: start;\n" +
  "}\n" +
  "text.comment {\n" +
  "font: italic 12px monospace;\n" +
  "}\n" +
  "rect {\n" +
  "stroke-width: 3;\n" +
  "stroke: black;\n" +
  "fill: #BCBCBC;\n" +
  "}\n" +
  "path.diagram-text {\n" +
  "stroke-width: 3;\n" +
  "stroke: black;\n" +
  "fill: #BCBCBC;\n" +
  "cursor: help;\n" +
  "}\n" +
  "]]></style>\n" +
  "</defs>\n";

  let result = eval(input.railroad);
  result = result.replace(/<svg /, "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" ");
  result = result.replace(/<g transform/, css + "<g transform");
  result = result.replace(/:href="#\//g, ":href=\"#/" + language + "/");

  const target = folder + language + "/" + input.type + "_" + input.name + ".svg";
  writeFileSync(target, result, "utf8");

  return result;
}

function findUsedBy(object, file) {
  const ret = [];
  const search = object.type + "/" + object.name;
  for(const obj of file.structures) {
    if (obj.using.indexOf(search) >= 0) {
      ret.push(obj.type + "/" + obj.name);
    }
  }
  for(const obj of file.expressions) {
    if (obj.using.indexOf(search) >= 0) {
      ret.push(obj.type + "/" + obj.name);
    }
  }
  for(const obj of file.statements) {
    if (obj.using.indexOf(search) >= 0) {
      ret.push(obj.type + "/" + obj.name);
    }
  }
  return ret;
}

function filename(name) {
  return name.replace(/(.)([A-Z])/g, "$1_$2").toLowerCase() + ".ts";
}

function run(data, language) {
  const file = data;

  for (const index in file.structures) {
    file.structures[index].svg = generateSVG(file.structures[index], language);
    file.structures[index].used_by = findUsedBy(file.structures[index], file);
    file.structures[index].filename = filename(file.structures[index].name);
  }
  for (const index in file.statements) {
    file.statements[index].svg = generateSVG(file.statements[index], language);
    file.statements[index].used_by = findUsedBy(file.statements[index], file);
    file.statements[index].filename = filename(file.statements[index].name);
  }
  for (const index in file.expressions) {
    file.expressions[index].svg = generateSVG(file.expressions[index], language);
    file.expressions[index].used_by = findUsedBy(file.expressions[index], file);
    file.expressions[index].filename = filename(file.expressions[index].name);
  }

  return file;
}

export function generate(data, language) {
  const json = run(data, language);
  writeFileSync(folder + language + ".json.js", language + "Data = " + JSON.stringify(json, null, 2) + ";", "utf8");
}