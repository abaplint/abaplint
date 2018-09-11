import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Source} from "../expressions";

export class DeleteReport extends Statement {

  public static get_matcher(): IRunnable {
    let state = seq(str("STATE"), new Source());

    return seq(str("DELETE REPORT"),
               new Source(),
               opt(state));
  }

}