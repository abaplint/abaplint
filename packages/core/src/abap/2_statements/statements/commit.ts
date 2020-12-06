import {IStatement} from "./_statement";
import {seqs, opts, alts} from "../combi";
import {DatabaseConnection} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Commit implements IStatement {

  public getMatcher(): IStatementRunnable {
    const work = seqs("WORK", opts("AND WAIT"));

    return seqs("COMMIT", alts(work, DatabaseConnection));
  }

}