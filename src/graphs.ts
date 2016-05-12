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
    for (let st in Statements) {
// todo, all statements should be implemented in get_matcher
      if (Statements[st].get_matcher !== undefined) {
        this.handle(st.toLowerCase(), Statements[st].get_matcher());
      }
    }

    for (let foo in Reuse) {
      this.handle(Reuse[foo]().get_name(), Reuse[foo]().get_runnable(), "blue");
    }
  }
}

Viz.run();