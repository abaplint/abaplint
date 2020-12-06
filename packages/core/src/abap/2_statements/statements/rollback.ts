import {IStatement} from "./_statement";
import {seqs, altPrios} from "../combi";
import {DatabaseConnection} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Rollback implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seqs("ROLLBACK", altPrios("WORK", DatabaseConnection));
  }

}