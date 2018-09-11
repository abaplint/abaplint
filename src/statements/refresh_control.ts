import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";

export class RefreshControl extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("REFRESH CONTROL"),
               new Source(),
               str("FROM SCREEN"),
               new Source());
  }

}