import * as Combi from "../src/combi";
import * as Statements from "../src/statements/";
import Reuse from "../src/statements/reuse";

import * as fs from "fs";

class Viz {
  private static FOLDER = "./web/viz/";

  public static handle(name: string, runnable: Combi.IRunnable, color = "black") {
    let str = Combi.Combi.viz(name, runnable, color);
    fs.writeFileSync(this.FOLDER + name + ".txt", str, "utf8");
  }

  public static run() {
    for (let foo in Reuse) {
      let name = Reuse[foo]().get_name();
      this.handle(name, Reuse[foo]().get_runnable(), "blue");
    }

    let missing = 0;
    for (let st in Statements) {
      let name = st.toLowerCase();
      if (Statements[st].get_matcher !== undefined) {
        this.handle(name, Statements[st].get_matcher());
      } else {
        console.log("Missing: " + name);
        missing++;
      }
    }
    console.log(missing + " top level statements missing matchers");
// todo, when all get_matcher are implemented, the match methods can be removed?
  }
}

Viz.run();