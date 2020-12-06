import {IStatement} from "./_statement";
import {seqs} from "../combi";
import {Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class TestSeam implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seqs("TEST-SEAM", Field);
  }

}