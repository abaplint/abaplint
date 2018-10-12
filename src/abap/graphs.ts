import * as Combi from "./combi";
import * as fs from "fs";
import {Artifacts} from "./artifacts";

// todo, move this method to somewhere under web/viz?

function className(cla: any) {
  return (cla.constructor + "").match(/\w+/g)[1];
}

class Graph {

  public static run() {
    for (let expr of Artifacts.getExpressions()) {
      this.writeRunnable("expression_" + className(expr), expr.getRunnable(), true);
    }

    for (let stat of Artifacts.getStatements()) {
      this.writeRunnable("statement_" + className(stat), stat.getMatcher(), false);
    }

// todo, getStructures
  }

  private static writeRunnable(name: string, runnable: Combi.IRunnable, complex: boolean) {
    let str = Combi.Combi.railroad(runnable, complex);
    fs.writeFileSync("./web/viz/" + name + ".txt", str, "utf8");
  }

}

Graph.run();