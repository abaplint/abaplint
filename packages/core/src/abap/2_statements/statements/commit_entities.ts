import {IStatement} from "./_statement";
import {opt, optPrio, seq, ver} from "../combi";
import {NamespaceSimpleName, Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class CommitEntities implements IStatement {

  public getMatcher(): IStatementRunnable {

    const failed = seq("FAILED", Target);
    const reported = seq("REPORTED", Target);

    const responses = seq("RESPONSES", failed, reported);

    const s = seq("COMMIT ENTITIES",
                  optPrio("IN SIMULATION MODE"),
                  opt(responses),
                  opt(seq("RESPONSE OF", NamespaceSimpleName, failed, reported)));

    return ver(Version.v754, s);
  }

}