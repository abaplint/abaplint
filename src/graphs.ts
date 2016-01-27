import * as Combi from "../src/combi";
import * as Statements from "../src/statements/";

import * as fs from "fs";

class Viz {
    private static FOLDER = "./web/viz/";

    public static run() {
        let str = Combi.Combi.viz("data", Statements.Data.get_matcher());
        fs.writeFileSync(this.FOLDER + "data.txt", str, "utf8");
    }

}

Viz.run();