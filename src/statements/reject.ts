import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";

export class Reject extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("REJECT"), opt(new Reuse.Source()));
  }

}