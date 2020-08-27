import {IStatement} from "./_statement";
import {str, seq, altPrio} from "../combi";
import {Cond, Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Check implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("CHECK"), altPrio(new Cond(), new Field()));

    return ret;
  }

}