import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Multiply extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("MULTIPLY"),
               new Target(),
               str("BY"),
               new Source());
  }

}