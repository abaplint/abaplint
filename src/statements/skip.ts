import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Source} from "../expressions";

export class Skip extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("SKIP"),
               opt(str("TO LINE")),
               opt(new Source()));
  }

}