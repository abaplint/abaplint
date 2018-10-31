import * as Combi from "./combi";
import * as fs from "fs";
import {Artifacts} from "./artifacts";

// todo, move this method to somewhere under web/syntax?

function className(cla: any): string {
  return (cla.constructor + "").match(/\w+/g)[1];
}

class Graph {

  public static run(): void {
    for (let expr of Artifacts.getExpressions()) {
      this.writeRunnable("expression_" + className(expr), expr.getRunnable(), true);
    }

    for (let stat of Artifacts.getStatements()) {
      this.writeRunnable("statement_" + className(stat), stat.getMatcher(), false);
    }

    for (let stru of Artifacts.getStructures()) {
      let str = "Railroad.Diagram.INTERNAL_ALIGNMENT = 'left';\n" +
        "Railroad.Diagram(" + stru.getMatcher().toRailroad() + ").toString();";
      let using = stru.getMatcher().getUsing();
      this.writeFile("structure_" + className(stru), str, using);
    }
  }

  private static writeRunnable(name: string, runnable: Combi.IRunnable, complex: boolean): void {
    let str = Combi.Combi.railroad(runnable, complex);
    this.writeFile(name, str, runnable.getUsing());
  }

  private static writeFile(name: string, railroad: string, using: string[]) {
    let unique = using.filter((v, i, a) => { return a.indexOf(v) === i; });
    let json = {railroad, using: unique.sort()};
    fs.writeFileSync("./syntax/" + name + ".json", JSON.stringify(json, undefined, 2), "utf8");
  }

}

Graph.run();