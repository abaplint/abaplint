import {Statement} from "./_statement";
import {str, seq, alt, IStatementRunnable} from "../combi";
import {DatabaseConnection} from "../expressions";

export class Rollback extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("ROLLBACK"), alt(str("WORK"), new DatabaseConnection()));
  }

}