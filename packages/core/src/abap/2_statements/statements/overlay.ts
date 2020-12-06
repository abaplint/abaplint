import {IStatement} from "./_statement";
import {verNot, seq, opt} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Overlay implements IStatement {

  public getMatcher(): IStatementRunnable {
    const only = seq("ONLY", Source);

    const ret = seq("OVERLAY",
                    Target,
                    "WITH",
                    Source,
                    opt(only));

    return verNot(Version.Cloud, ret);
  }

}