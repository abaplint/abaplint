import {IStatement} from "./_statement";
import {verNot, str, seqs, opt} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CreateOLE implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("CREATE OBJECT",
                     Target,
                     Source,
                     opt(str("NO FLUSH")),
                     opt(str("QUEUE-ONLY")));

    return verNot(Version.Cloud, ret);
  }

}