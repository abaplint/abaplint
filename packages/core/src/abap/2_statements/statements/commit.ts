import {IStatement} from "./_statement";
import {seq, opt, alt} from "../combi";
import {DatabaseConnection} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Commit implements IStatement {

  public getMatcher(): IStatementRunnable {
    const work = seq("WORK", opt("AND WAIT"));

    return seq("COMMIT", alt(work, DatabaseConnection));
  }

}