import {IStatement} from "./_statement";
import {verNot, seqs, opts} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Transfer implements IStatement {

  public getMatcher(): IStatementRunnable {
    const length = seqs("LENGTH", Source);

    const ret = seqs("TRANSFER",
                     Source,
                     "TO",
                     Target,
                     opts(length),
                     opts("NO END OF LINE"));

    return verNot(Version.Cloud, ret);
  }

}