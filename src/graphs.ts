import * as Combi from "../src/combi";
import * as Statements from "../src/statements/";

import * as fs from "fs";

class Viz {
    private static FOLDER = "./web/viz/";

    public static run() {
        for (let st in Statements) {
// todo, all statements should be implemented in get_matcher
            if (Statements[st].get_matcher !== undefined) {
                let str = Combi.Combi.viz(st.toLowerCase(), Statements[st].get_matcher());
                fs.writeFileSync(this.FOLDER + st.toLowerCase() + ".txt", str, "utf8");
            }
        }
    }
}

Viz.run();