import {IStatement} from "./_statement";
import {verNot, str, seq, opt} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class DeleteReport implements IStatement {

  public getMatcher(): IStatementRunnable {
    const state = seq(str("STATE"), new Source());

    const ret = seq(str("DELETE REPORT"),
                    new Source(),
                    opt(state));

    return verNot(Version.Cloud, ret);
  }

}