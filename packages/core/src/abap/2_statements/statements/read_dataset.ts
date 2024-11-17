import {IStatement} from "./_statement";
import {verNot, seq, opt, per} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ReadDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("READ DATASET",
                    Source,
                    "INTO",
                    Target,
                    opt(per(seq("MAXIMUM LENGTH", Source),
                            seq("ACTUAL LENGTH", Target),
                            seq("LENGTH", Target))));

    return verNot(Version.Cloud, ret);
  }

}