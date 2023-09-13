import {IStatement} from "./_statement";
import {verNot, seq, optPrio} from "../combi";
import {Select, SQLTarget} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class OpenCursor implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("OPEN CURSOR",
                    optPrio("WITH HOLD"),
                    SQLTarget,
                    "FOR",
                    Select);

    return verNot(Version.Cloud, ret);
  }

}