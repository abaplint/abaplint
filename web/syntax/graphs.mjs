/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import fs from "fs";
import Combi from "../../packages/core/build/src/abap/2_statements/combi.js";
import {Artifacts} from "../../packages/core/build/src/abap/artifacts.js";

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

  static run() {
    return this.buildData();
  }

  static buildData() {
    const res = {expressions: [], statements: [], structures: []};

    for (const expr of Artifacts.getExpressions()) {
      res.expressions.push(this.buildRunnable(new expr().constructor.name, "expression", new expr().getRunnable(), true));
    }

    for (const stat of Artifacts.getStatements()) {
      res.statements.push(this.buildRunnable(stat.constructor.name, "statement", stat.getMatcher(), false));
    }

    for (const stru of Artifacts.getStructures()) {
      const str = "Railroad.Diagram.INTERNAL_ALIGNMENT = 'left';\n" +
        "Railroad.Diagram(" + stru.getMatcher().toRailroad() + ").toString();";
      const using = stru.getMatcher().getUsing();
      res.structures.push({
        name: stru.constructor.name,
        type: "structure",
        railroad: str,
        using: sort(using)});
    }

    res.expressions.sort(compareString);
    res.statements.sort(compareString);
    res.structures.sort(compareString);

    return res;
  }

  static buildRunnable(name, type, runnable, complex) {
    return {
      name: name,
      type: type,
      railroad: Combi.Combi.railroad(runnable, complex),
      using: sort(runnable.getUsing())};
  }

}

