import {IStatement} from "./_statement";
import {seqs, opts} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class SetBit implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("SET BIT",
                     Source,
                     "OF",
                     Target,
                     opts(seqs("TO", Source)));

    return ret;
  }

}