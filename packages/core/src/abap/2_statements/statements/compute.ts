import {IStatement} from "./_statement";
import {verNot, seqs, opts} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Compute implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("COMPUTE",
                     opts("EXACT"),
                     Target,
                     "=",
                     Source);

    return verNot(Version.Cloud, ret);
  }

}