import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {SimpleName} from "../expressions";

export class ExecSql extends Statement {

  public static get_matcher(): IRunnable {
    let performing = seq(str("PERFORMING"), new SimpleName());

    return seq(str("EXEC SQL"), opt(performing));
  }

}