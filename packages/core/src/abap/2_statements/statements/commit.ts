import {IStatement} from "./_statement";
import {seq, opts, alt} from "../combi";
import {DatabaseConnection} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Commit implements IStatement {

  public getMatcher(): IStatementRunnable {
    const work = seq("WORK", opts("AND WAIT"));

    return seq("COMMIT", alt(work, DatabaseConnection));
  }

}