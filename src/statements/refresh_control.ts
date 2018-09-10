import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class RefreshControl extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("REFRESH CONTROL"),
               new Reuse.Source(),
               str("FROM SCREEN"),
               new Reuse.Source());
  }

}