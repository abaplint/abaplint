import {IStatement} from "./_statement";
import {verNot, ver, seq, optPrio} from "../combi";
import {Select, SQLTarget, SQLOptions, SQLPrivilegedAccess} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class OpenCursor implements IStatement {

  public getMatcher(): IStatementRunnable {
    const privileged = ver(Version.v752, seq("WITH", SQLPrivilegedAccess));

    const ret = seq("OPEN CURSOR",
                    optPrio("WITH HOLD"),
                    SQLTarget,
                    "FOR",
                    Select,
                    optPrio(privileged),
                    optPrio(SQLOptions));

    return verNot(Version.Cloud, ret);
  }

}