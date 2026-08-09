/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import Combi from "../../packages/core/build/src/abap/2_statements/combi.js";
import {BuiltIn} from "../../packages/core/build/src/abap/5_syntax/_builtin.js";
import {ArtifactsABAP} from "../../packages/core/build/src/abap/artifacts.js";
import {ArtifactsDDL} from "../../packages/core/build/src/ddl/artifacts.js";
import {ArtifactsCDS} from "../../packages/core/build/src/cds/artifacts.js";

function sort(data) {
  const unique = data.filter((v, i, a) => { return a.indexOf(v) === i; });
  return unique.sort();
}

function compareString(a, b) {
  if (a.name < b.name) { return -1; }
  if (a.name > b.name) { return 1; }
  return 0;
}

export class Graph {

  static buildDDLData() {
    const res = {expressions: [], statements: [], structures: [], functions: []};

    for (const expr of ArtifactsDDL.getExpressions()) {
      res.expressions.push(this.buildRunnable(new expr().constructor.name, "expression", new expr().getRunnable(), true));
    }

    res.expressions.sort(compareString);

    return res;
  }

  static buildCDSData() {
    const res = {expressions: [], statements: [], structures: [], functions: []};

    for (const expr of ArtifactsCDS.getExpressions()) {
      res.expressions.push(this.buildRunnable(new expr().constructor.name, "expression", new expr().getRunnable(), true));
    }

    res.expressions.sort(compareString);

    return res;
  }

  static buildABAPData() {
    const res = {expressions: [], statements: [], structures: [], functions: []};

    for (const expr of ArtifactsABAP.getExpressions()) {
      res.expressions.push(this.buildRunnable(new expr().constructor.name, "expression", new expr().getRunnable(), true));
    }

    for (const stat of ArtifactsABAP.getStatements()) {
      res.statements.push(this.buildRunnable(stat.constructor.name, "statement", stat.getMatcher(), false));
    }

    for (const stru of ArtifactsABAP.getStructures()) {
      const str = "Railroad.Diagram.INTERNAL_ALIGNMENT = 'left';\n" +
        "Railroad.Diagram(" + stru.getMatcher().toRailroad() + ").toString();";
      const using = stru.getMatcher().getUsing();
      res.structures.push({
        name: stru.constructor.name,
        type: "structure",
        railroad: str,
        using: sort(using)});
    }

    for (const name in BuiltIn.methods) {
      res.functions.push(this.buildFunction(name, BuiltIn.methods[name]));
    }

    res.expressions.sort(compareString);
    res.statements.sort(compareString);
    res.structures.sort(compareString);
    res.functions.sort(compareString);

    return res;
  }

  static buildRunnable(name, type, runnable, complex) {
    return {
      name: name,
      type: type,
      railroad: Combi.Combi.railroad(runnable, complex),
      using: sort(runnable.getUsing())};
  }

  static buildFunction(name, method) {
    const children = [
      this.terminal(name),
      this.terminal("("),
    ];

    for (const [parameter, type] of Object.entries(method.mandatory || {})) {
      children.push(this.buildFunctionParameter(parameter, type));
    }

    for (const [parameter, type] of Object.entries(method.optional || {})) {
      children.push("Railroad.Optional(" + this.buildFunctionParameter(parameter, type) + ")");
    }

    children.push(this.terminal(")"));

    return {
      name: name,
      type: "function",
      railroad: "Railroad.Diagram.INTERNAL_ALIGNMENT = 'left';\n"
        + "Railroad.Diagram(Railroad.Sequence(" + children.join(",") + ")).toString();",
      using: [],
      return_type: this.formatType(method.return),
      release: method.release?.abap,
      source: "packages/core/src/abap/5_syntax/_builtin.ts"};
  }

  static buildFunctionParameter(parameter, type) {
    return "Railroad.Sequence("
      + this.terminal(parameter.toUpperCase()) + ","
      + this.terminal("=") + ","
      + "Railroad.NonTerminal(" + JSON.stringify(this.formatType(type)) + "))";
  }

  static terminal(text) {
    return "Railroad.Terminal(" + JSON.stringify(text) + ")";
  }

  static formatType(type) {
    const qualified = type.getQualifiedName?.() || type.getDDICName?.();
    if (qualified) {
      return qualified;
    }

    try {
      return type.toABAP();
    } catch {
      return type.constructor.name
        .replace(/Type$/, "")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .toLowerCase();
    }
  }

}
