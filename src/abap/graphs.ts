import * as Combi from "./combi";
import * as fs from "fs";
import {Artifacts} from "./artifacts";

// todo, move this method to somewhere under web/syntax?

function sort(data: string[]): string[] {
  const unique = data.filter((v, i, a) => { return a.indexOf(v) === i; });
  return unique.sort();
}

interface IData {
  name: string;
  railroad: string;
  type: string;
  using: string[];
}

interface ICollection {
  expressions: IData[];
  statements: IData[];
  structures: IData[];
}

function compareString(a: IData, b: IData): number {
  if (a.name < b.name) { return -1; }
  if (a.name > b.name) { return 1; }
  return 0;
}

class Graph {

  public static run(): void {
    this.writeFile(this.buildData());
  }

  private static buildData(): ICollection {
    const res: ICollection = {expressions: [], statements: [], structures: []};

    for (const expr of Artifacts.getExpressions()) {
      res.expressions.push(this.buildRunnable(expr.constructor.name, "expression", expr.getRunnable(), true));
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

  private static buildRunnable(name: string, type: string, runnable: Combi.IRunnable, complex: boolean): IData {
    return {
      name: name,
      type: type,
      railroad: Combi.Combi.railroad(runnable, complex),
      using: sort(runnable.getUsing())};
  }

  private static writeFile(data: any) {
    fs.writeFileSync("./syntax/generated.json", JSON.stringify(data, undefined, 2), "utf8");
  }

}

Graph.run();