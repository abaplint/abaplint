import {IStatement} from "./_statement";
import {verNot, str, seq, opt} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CreateOLE implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("CREATE OBJECT"),
                    new Target(),
                    new Source(),
                    opt(str("NO FLUSH")),
                    opt(str("QUEUE-ONLY")));

    return verNot(Version.Cloud, ret);
  }

}