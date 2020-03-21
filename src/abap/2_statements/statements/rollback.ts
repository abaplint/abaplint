import {IStatement} from "./_statement";
import {str, seq, alt, IStatementRunnable} from "../combi";
import {DatabaseConnection} from "../expressions";

export class Rollback implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("ROLLBACK"), alt(str("WORK"), new DatabaseConnection()));
  }

}