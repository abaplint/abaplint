import {IStatement} from "./_statement";
import {str, seq, opt, alt} from "../combi";
import {DatabaseConnection} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Commit implements IStatement {

  public getMatcher(): IStatementRunnable {
    const work = seq(str("WORK"), opt(str("AND WAIT")));

    return seq(str("COMMIT"), alt(work, new DatabaseConnection()));
  }

}