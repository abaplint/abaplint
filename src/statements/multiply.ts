import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";
import {Target} from "../expressions";

export class Multiply extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("MULTIPLY"),
               new Target(),
               str("BY"),
               new Reuse.Source());
  }

}