import {IStatement} from "./_statement";
import {seq, altPrio} from "../combi";
import {Cond, Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Check implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("CHECK", altPrio(Cond, Field));

    return ret;
  }

}