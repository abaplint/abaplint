import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class DeleteReport extends Statement {

  public static get_matcher(): IRunnable {
    let state = seq(str("STATE"), new Reuse.Source());

    return seq(str("DELETE REPORT"),
               new Reuse.Source(),
               opt(state));
  }

}