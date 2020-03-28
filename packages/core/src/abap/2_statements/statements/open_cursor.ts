import {IStatement} from "./_statement";
import {verNot, str, seq, optPrio} from "../combi";
import {Select, SQLTarget, SQLHints} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class OpenCursor implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("OPEN CURSOR"),
                    optPrio(str("WITH HOLD")),
                    new SQLTarget(),
                    str("FOR"),
                    new Select(),
                    optPrio(new SQLHints()));

    return verNot(Version.Cloud, ret);
  }

}