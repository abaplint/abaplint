import {IStatement} from "./_statement";
import {altPrio, optPrio, seq, ver, AlsoIn} from "../combi";
import {SimpleName, Source, Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";

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
    return ver(Release.v754, s, {also: AlsoIn.OpenABAP});
  }

}
