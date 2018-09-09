import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";

export class Condense extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("CONDENSE"),
               new Reuse.Target(),
               opt(str("NO-GAPS")));
  }

}