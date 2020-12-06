import {IStatement} from "./_statement";
import {verNot, seq, opts} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Reject implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("REJECT", opts(Source));

    return verNot(Version.Cloud, ret);
  }

}