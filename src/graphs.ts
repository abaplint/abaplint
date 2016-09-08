import * as Combi from "../src/combi";
import * as Statements from "../src/statements/";
import * as Reuse from "../src/statements/reuse";
import * as fs from "fs";

function className(cla) {
  return (cla.constructor + "").match(/\w+/g)[1];
}

class Graph {

  public static handle(prefix: string, name: string, runnable: Combi.IRunnable, complex: boolean) {
    let str = Combi.Combi.railroad(runnable, complex);
    fs.writeFileSync("./web/viz/" + prefix + name + ".txt", str, "utf8");
  }

  public static run() {
    for (let foo in Reuse) {
      let name = className(new Reuse[foo]()).toLowerCase();
      this.handle("reuse_", name, new Reuse[foo]().get_runnable(), true);
    }

    for (let st in Statements) {
      let name = st.toLowerCase();
      this.handle("", name, Statements[st].get_matcher(), false);
    }
  }
}

Graph.run();