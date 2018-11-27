import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {Cond} from "../expressions";

export class Check extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("CHECK"), new Cond());

    return ret;
  }

}