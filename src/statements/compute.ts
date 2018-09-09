import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";

export class Compute extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("COMPUTE"),
               opt(str("EXACT")),
               new Reuse.Target(),
               str("="),
               new Reuse.Source());
  }

}