import {IStatement} from "./_statement";
import {altPrio, optPrio, seq, ver} from "../combi";
import {SimpleName, Source, Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class GetPermissions implements IStatement {

  public getMatcher(): IStatementRunnable {
    const type = altPrio("GLOBAL AUTHORIZATION", "INSTANCE");

    const from = seq("FROM", Source);

    const s = seq("GET PERMISSIONS ONLY", type, "ENTITY",
                  SimpleName,
                  optPrio(from),
                  "REQUEST", Source,
                  "RESULT", Target,
                  "FAILED", Target,
                  "REPORTED", Target);
    return ver(Version.v754, s);
  }

}