import {IStatement} from "./_statement";
import {verNot, str, seq, opt} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Reject implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("REJECT"), opt(new Source()));

    return verNot(Version.Cloud, ret);
  }

}