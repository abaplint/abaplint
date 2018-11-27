import {Statement} from "./_statement";
import {str, seq, alt, IStatementRunnable} from "../combi";
import {Dynamic, Field} from "../expressions";

export class Rollback extends Statement {

  public getMatcher(): IStatementRunnable {
    const connection = seq(str("CONNECTION"),
                           alt(new Dynamic(), new Field()));

    return seq(str("ROLLBACK"), alt(str("WORK"), connection));
  }

}