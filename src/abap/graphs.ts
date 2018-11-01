import * as Combi from "./combi";
import * as fs from "fs";
import {Artifacts} from "./artifacts";

// todo, move this method to somewhere under web/syntax?

function sort(data: string[]): string[] {
  let unique = data.filter((v, i, a) => { return a.indexOf(v) === i; });
  return unique.sort();
}

interface IData {
  name: string;
  railroad: string;
  type: string;
  using: string[];
}

class Graph {

  public static run(): void {
    this.writeFile(this.buildData());
  }

  private static buildData(): IData[] {
    let res: IData[] = [];

    for (let expr of Artifacts.getExpressions()) {
      res.push(this.buildRunnable(expr.constructor.name, "expression", expr.getRunnable(), true));
    }

    for (let stat of Artifacts.getStatements()) {
      res.push(this.buildRunnable(stat.constructor.name, "statement", stat.getMatcher(), false));
    }

    for (let stru of Artifacts.getStructures()) {
      let str = "Railroad.Diagram.INTERNAL_ALIGNMENT = 'left';\n" +
        "Railroad.Diagram(" + stru.getMatcher().toRailroad() + ").toString();";
      let using = stru.getMatcher().getUsing();
      res.push({
        name: "structure_" + stru.constructor.name,
        type: "structure",
        railroad: str,
        using: sort(using)});
    }

    return res;
  }

  private static buildRunnable(name: string, type: string, runnable: Combi.IRunnable, complex: boolean): IData {
    return {
      name: type + "_" + name,
      type: type,
      railroad: Combi.Combi.railroad(runnable, complex),
      using: sort(runnable.getUsing())};
  }

  private static writeFile(data: IData[]) {
    fs.writeFileSync("./syntax/generated.json", JSON.stringify(data, undefined, 2), "utf8");
  }

}

Graph.run();