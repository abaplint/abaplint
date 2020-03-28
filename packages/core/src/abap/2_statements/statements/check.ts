import {IStatement} from "./_statement";
import {str, seq} from "../combi";
import {Cond} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Check implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("CHECK"), new Cond());

    return ret;
  }

}