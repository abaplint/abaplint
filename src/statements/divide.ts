import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Divide extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("DIVIDE"),
               new Target(),
               str("BY"),
               new Source());
  }

}