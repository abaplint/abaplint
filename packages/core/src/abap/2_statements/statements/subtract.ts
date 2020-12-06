import {IStatement} from "./_statement";
import {seqs} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Subtract implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("SUBTRACT",
                     Source,
                     "FROM",
                     Target);

    return ret;
  }

}