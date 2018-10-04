import * as Combi from "./combi";
import * as Statements from "./statements/";
import * as Expressions from "./expressions";
import * as fs from "fs";

function className(cla: any) {
  return (cla.constructor + "").match(/\w+/g)[1];
}

class Graph {

  public static handle(prefix: string, name: string, runnable: Combi.IRunnable, complex: boolean) {
    let str = Combi.Combi.railroad(runnable, complex);
    fs.writeFileSync("./web/viz/" + prefix + name + ".txt", str, "utf8");
  }

  public static run() {
    for (let foo in Expressions) {
      const expr: any = Expressions;
      if (typeof expr[foo] === "function") {
        let name = className(new expr[foo]()).toLowerCase();
        this.handle("expression_", name, new expr[foo]().get_runnable(), true);
      }
    }

    for (let st in Statements) {
      let name = st.toLowerCase();
      const stat: any = Statements;
      if (typeof stat[st].get_matcher === "function") {
        this.handle("", name, stat[st].get_matcher(), false);
      }
    }
  }
}

Graph.run();