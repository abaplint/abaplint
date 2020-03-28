import {IStatement} from "./_statement";
import {verNot, str, seq, opt} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ReadDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("READ DATASET"),
                    new Source(),
                    str("INTO"),
                    new Target(),
                    opt(seq(str("MAXIMUM LENGTH"), new Source())),
                    opt(seq(str("ACTUAL LENGTH"), new Target())),
                    opt(seq(str("LENGTH"), new Target())));

    return verNot(Version.Cloud, ret);
  }

}