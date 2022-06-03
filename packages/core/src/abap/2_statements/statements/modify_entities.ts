import {IStatement} from "./_statement";
import {alt, opt, optPrio, per, plus, seq, ver} from "../combi";
import {SimpleName, Source, Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class ModifyEntities implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fieldsWith = seq("FIELDS (", plus(SimpleName), ") WITH", Source);
    const operation = alt(
      seq("UPDATE SET FIELDS WITH", Source),
      seq("UPDATE", fieldsWith),
      seq("DELETE FROM", Source),
      seq("EXECUTE", SimpleName, "FROM", Source),
      seq("CREATE", optPrio("AUTO FILL CID"), fieldsWith));

    const s = seq("MODIFY ENTITIES OF", SimpleName,
                  opt("IN LOCAL MODE"),
                  "ENTITY", SimpleName,
                  operation,
                  optPrio(seq("MAPPED", Target)),
                  per(seq("FAILED", Target),
                      seq("RESULT", Target),
                      seq("REPORTED", Target)));
    return ver(Version.v754, s);
  }

}