import {IStatement} from "./_statement";
import {verNot, seq, optPrios} from "../combi";
import {Select, SQLTarget, SQLHints} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class OpenCursor implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("OPEN CURSOR",
                    optPrios("WITH HOLD"),
                    SQLTarget,
                    "FOR",
                    Select,
                    optPrios(SQLHints));

    return verNot(Version.Cloud, ret);
  }

}