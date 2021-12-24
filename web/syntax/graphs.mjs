/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import Combi from "../../packages/core/build/src/abap/2_statements/combi.js";
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
    const res = {expressions: [], statements: [], structures: []};

    for (const expr of ArtifactsDDL.getExpressions()) {
      res.expressions.push(this.buildRunnable(new expr().constructor.name, "expression", new expr().getRunnable(), true));
    }

    res.expressions.sort(compareString);

    return res;
  }

  static buildCDSData() {
    const res = {expressions: [], statements: [], structures: []};

    for (const expr of ArtifactsCDS.getExpressions()) {
      res.expressions.push(this.buildRunnable(new expr().constructor.name, "expression", new expr().getRunnable(), true));
    }

    res.expressions.sort(compareString);

    return res;
  }

  static buildABAPData() {
    const res = {expressions: [], statements: [], structures: []};

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

