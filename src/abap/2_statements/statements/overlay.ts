import {IStatement} from "./_statement";
import {verNot, str, seq, opt} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Overlay implements IStatement {

  public getMatcher(): IStatementRunnable {
    const only = seq(str("ONLY"), new Source());

    const ret = seq(str("OVERLAY"),
                    new Target(),
                    str("WITH"),
                    new Source(),
                    opt(only));

    return verNot(Version.Cloud, ret);
  }

}