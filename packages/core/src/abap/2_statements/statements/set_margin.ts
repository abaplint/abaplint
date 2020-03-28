import {IStatement} from "./_statement";
import {verNot, str, seq} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetMargin implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("SET MARGIN"),
                    new Source(),
                    new Source());

    return verNot(Version.Cloud, ret);
  }

}