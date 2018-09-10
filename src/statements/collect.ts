import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import * as Reuse from "./reuse";
import {Target} from "../expressions";

export class Collect extends Statement {

  public static get_matcher(): IRunnable {
    let into = seq(str("INTO"), new Target());

    return seq(str("COLLECT"),
               new Reuse.Source(),
               opt(into));
  }

}