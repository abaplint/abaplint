import {IStatement} from "./_statement";
import {verNot, seqs, opts} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ReadDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("READ DATASET",
                     Source,
                     "INTO",
                     Target,
                     opts(seqs("MAXIMUM LENGTH", Source)),
                     opts(seqs("ACTUAL LENGTH", Target)),
                     opts(seqs("LENGTH", Target)));

    return verNot(Version.Cloud, ret);
  }

}