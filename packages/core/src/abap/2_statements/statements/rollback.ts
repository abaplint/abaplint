import {IStatement} from "./_statement";
import {str, seqs, altPrio} from "../combi";
import {DatabaseConnection} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Rollback implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seqs("ROLLBACK", altPrio(str("WORK"), new DatabaseConnection()));
  }

}