import {IStatement} from "./_statement";
import {seq, ver} from "../combi";
import {SimpleName, Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class CommitEntities implements IStatement {

  public getMatcher(): IStatementRunnable {
    const s = seq("COMMIT ENTITIES RESPONSE OF", SimpleName,
                  "FAILED", Target,
                  "REPORTED", Target);
    return ver(Version.v754, s);
  }

}