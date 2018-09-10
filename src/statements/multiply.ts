import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class Multiply extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("MULTIPLY"),
               new Reuse.Target(),
               str("BY"),
               new Reuse.Source());
  }

}