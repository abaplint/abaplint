import {IStatement} from "./_statement";
import {seq, ver} from "../combi";
import {SimpleName, Source, Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class SetLocks implements IStatement {

  public getMatcher(): IStatementRunnable {
    const s = seq("SET LOCKS OF",
                  SimpleName,
                  "ENTITY",
                  SimpleName,
                  "FROM", Source,
                  "FAILED", Target,
                  "REPORTED", Target);
    return ver(Version.v754, s);
  }

}