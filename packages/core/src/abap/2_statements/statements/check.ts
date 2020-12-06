import {IStatement} from "./_statement";
import {seqs, altPrios} from "../combi";
import {Cond, Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Check implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("CHECK", altPrios(Cond, Field));

    return ret;
  }

}