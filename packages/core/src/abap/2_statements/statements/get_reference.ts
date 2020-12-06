import {IStatement} from "./_statement";
import {seqs} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class GetReference implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("GET REFERENCE OF",
                     Source,
                     "INTO",
                     Target);

    return ret;
  }

}