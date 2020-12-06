import {IStatement} from "./_statement";
import {verNot, seq, opts} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ReadDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("READ DATASET",
                    Source,
                    "INTO",
                    Target,
                    opts(seq("MAXIMUM LENGTH", Source)),
                    opts(seq("ACTUAL LENGTH", Target)),
                    opts(seq("LENGTH", Target)));

    return verNot(Version.Cloud, ret);
  }

}