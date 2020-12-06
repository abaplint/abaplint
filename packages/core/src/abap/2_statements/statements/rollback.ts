import {IStatement} from "./_statement";
import {seq, altPrios} from "../combi";
import {DatabaseConnection} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Rollback implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("ROLLBACK", altPrios("WORK", DatabaseConnection));
  }

}