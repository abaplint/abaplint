import * as Combi from "../src/combi";
import * as Statements from "../src/statements/";
import Reuse from "../src/statements/reuse";

import * as fs from "fs";

class Graph {

  public static handle(prefix: string, name: string, runnable: Combi.IRunnable) {
    let str = Combi.Combi.viz(name, runnable);
    fs.writeFileSync("./web/viz/" + prefix + name + ".viz.txt", str, "utf8");

    str = Combi.Combi.railroad(name, runnable);
    fs.writeFileSync("./web/viz/" + prefix + name + ".railroad.txt", str, "utf8");
  }

  public static run() {
    for (let foo in Reuse) {
      let name = Reuse[foo]().get_name();
      this.handle("reuse_", name, Reuse[foo]().get_runnable());
    }

    let missing = 0;
    for (let st in Statements) {
      let name = st.toLowerCase();
      if (Statements[st].get_matcher !== undefined) {
        this.handle("", name, Statements[st].get_matcher());
      } else {
        console.log("Missing: " + name);
        missing++;
      }
    }
    console.log(missing + " top level statements missing matchers");
// todo, when all get_matcher are implemented, the match methods can be removed?
  }
}

Graph.run();