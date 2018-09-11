import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Source} from "../expressions";

export class Reject extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("REJECT"), opt(new Source()));
  }

}