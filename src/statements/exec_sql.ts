import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";

export class ExecSql extends Statement {

  public static get_matcher(): IRunnable {
    let performing = seq(str("PERFORMING"), new Reuse.SimpleName());

    return seq(str("EXEC SQL"), opt(performing));
  }

}