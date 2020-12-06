import {IStatement} from "./_statement";
import {seqs, opt} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class SetBit implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("SET BIT",
                     Source,
                     "OF",
                     Target,
                     opt(seqs("TO", Source)));

    return ret;
  }

}