import {IStatement} from "./_statement";
import {verNot, seqs, opts} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CreateOLE implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("CREATE OBJECT",
                     Target,
                     Source,
                     opts("NO FLUSH"),
                     opts("QUEUE-ONLY"));

    return verNot(Version.Cloud, ret);
  }

}