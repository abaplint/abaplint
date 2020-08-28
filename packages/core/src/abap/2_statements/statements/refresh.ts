import {IStatement} from "./_statement";
import {verNot, str, seq, optPrio} from "../combi";
import {Target, DatabaseTable} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Refresh implements IStatement {

  public getMatcher(): IStatementRunnable {
    const from = seq(str("FROM TABLE"), new DatabaseTable());

    const ret = seq(str("REFRESH"), new Target(), optPrio(from));

    return verNot(Version.Cloud, ret);
  }

}