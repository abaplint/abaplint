import {Statement} from "./statement";
import {str, seq, alt, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class Rollback extends Statement {

  public static get_matcher(): IRunnable {
    let connection = seq(str("CONNECTION"),
                         alt(new Reuse.Dynamic(), new Reuse.Field()));

    return seq(str("ROLLBACK"), alt(str("WORK"), connection));
  }

}