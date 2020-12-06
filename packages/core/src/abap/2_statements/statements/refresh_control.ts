import {IStatement} from "./_statement";
import {verNot, seq} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class RefreshControl implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("REFRESH CONTROL",
                    Source,
                    "FROM SCREEN",
                    Source);

    return verNot(Version.Cloud, ret);
  }

}