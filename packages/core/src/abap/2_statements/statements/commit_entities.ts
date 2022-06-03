import {IStatement} from "./_statement";
import {optPrio, seq, star, ver} from "../combi";
import {SimpleName, Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class CommitEntities implements IStatement {

  public getMatcher(): IStatementRunnable {
    const s = seq("COMMIT ENTITIES",
                  optPrio("IN SIMULATION MODE"),
                  star(seq("RESPONSE OF", SimpleName, "FAILED", Target, "REPORTED", Target)));
    return ver(Version.v754, s);
  }

}