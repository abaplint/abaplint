import {IStatement} from "./_statement";
import {str, seq, alt} from "../combi";
import {DatabaseConnection} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Rollback implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("ROLLBACK"), alt(str("WORK"), new DatabaseConnection()));
  }

}