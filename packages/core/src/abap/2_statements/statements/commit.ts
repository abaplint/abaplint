import {IStatement} from "./_statement";
import {seq, opts, alts} from "../combi";
import {DatabaseConnection} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Commit implements IStatement {

  public getMatcher(): IStatementRunnable {
    const work = seq("WORK", opts("AND WAIT"));

    return seq("COMMIT", alts(work, DatabaseConnection));
  }

}