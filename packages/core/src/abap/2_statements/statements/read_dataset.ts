import {IStatement} from "./_statement";
import {verNot, seqs, opt} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ReadDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("READ DATASET",
                     Source,
                     "INTO",
                     Target,
                     opt(seqs("MAXIMUM LENGTH", Source)),
                     opt(seqs("ACTUAL LENGTH", Target)),
                     opt(seqs("LENGTH", Target)));

    return verNot(Version.Cloud, ret);
  }

}