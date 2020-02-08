import {Statement} from "./_statement";
import {str, seq, opt, alt, IStatementRunnable} from "../combi";
import {DatabaseConnection} from "../expressions";

export class Commit extends Statement {

  public getMatcher(): IStatementRunnable {
    const work = seq(str("WORK"), opt(str("AND WAIT")));

    return seq(str("COMMIT"), alt(work, new DatabaseConnection()));
  }

}