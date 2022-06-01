import {IStatement} from "./_statement";
import {seq, ver} from "../combi";
import {SimpleName, Source, Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class GetPermissions implements IStatement {

  public getMatcher(): IStatementRunnable {
    const s = seq("GET PERMISSIONS ONLY GLOBAL AUTHORIZATION ENTITY",
                  SimpleName,
                  "REQUEST", Source,
                  "RESULT", Target,
                  "FAILED", Target,
                  "REPORTED", Target);
    return ver(Version.v754, s);
  }

}