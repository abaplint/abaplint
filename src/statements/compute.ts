import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Compute extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("COMPUTE"),
               opt(str("EXACT")),
               new Target(),
               str("="),
               new Source());
  }

}