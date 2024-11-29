import {IStatement} from "./_statement";
import {alt, opt, optPrio, per, plus, plusPrio, seq, ver} from "../combi";
import {NamespaceSimpleName, SimpleName, Source, Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class ModifyEntities implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fieldsWith = seq("FIELDS (", plus(SimpleName), ") WITH", Source);
    const operation = alt(
      seq("UPDATE SET FIELDS WITH", Source),
      seq("CREATE SET FIELDS WITH", Source),
      seq("UPDATE", fieldsWith),
      seq("DELETE FROM", Source),
      seq("EXECUTE", SimpleName, "FROM", Source),
      seq("CREATE", optPrio("AUTO FILL CID"), fieldsWith));

    const failed = seq("FAILED", Target);
    const result = seq("RESULT", Target);
    const mapped = seq("MAPPED", Target);
    const reported = seq("REPORTED", Target);
    const from = seq("FROM", Source);
    const execute = seq("EXECUTE", NamespaceSimpleName);

    const entities = seq("ENTITIES OF", NamespaceSimpleName,
                         opt("IN LOCAL MODE"),
                         plusPrio(seq("ENTITY", SimpleName, operation)),
                         optPrio(per(failed,
                                     result,
                                     mapped,
                                     reported)));

    const entity = seq("ENTITY", NamespaceSimpleName, execute, from, mapped, failed, reported);

    return ver(Version.v754, seq("MODIFY", alt(entities, entity)));
  }

}