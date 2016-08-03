import * as Combi from "../src/combi";
import * as Statements from "../src/statements/";
import Reuse from "../src/statements/reuse";

import * as fs from "fs";

class Graph {

  public static handle(prefix: string, name: string, runnable: Combi.IRunnable, complex: boolean) {
    let str = Combi.Combi.railroad(runnable, complex);
    fs.writeFileSync("./web/viz/" + prefix + name + ".txt", str, "utf8");
  }

  public static run() {
    for (let foo in Reuse) {
      let name = Reuse[foo]().get_name();
      this.handle("reuse_", name, Reuse[foo]().get_runnable(), true);
    }

    for (let st in Statements) {
      let name = st.toLowerCase();
      this.handle("", name, Statements[st].get_matcher(), false);
    }
  }
}

Graph.run();