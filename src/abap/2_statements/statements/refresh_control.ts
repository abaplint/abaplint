import {IStatement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";

export class RefreshControl implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("REFRESH CONTROL"),
                    new Source(),
                    str("FROM SCREEN"),
                    new Source());

    return verNot(Version.Cloud, ret);
  }

}