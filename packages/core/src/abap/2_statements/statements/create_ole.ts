import {IStatement} from "./_statement";
import {verNot, seq, opt} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CreateOLE implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("CREATE OBJECT",
                    Target,
                    Source,
                    opt("NO FLUSH"),
                    opt("QUEUE-ONLY"));

    return verNot(Version.Cloud, ret);
  }

}