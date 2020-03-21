import {IStatement} from "./_statement";
import {str, seq, opt, alt, IStatementRunnable} from "../combi";
import {DatabaseConnection} from "../expressions";

export class Commit implements IStatement {

  public getMatcher(): IStatementRunnable {
    const work = seq(str("WORK"), opt(str("AND WAIT")));

    return seq(str("COMMIT"), alt(work, new DatabaseConnection()));
  }

}