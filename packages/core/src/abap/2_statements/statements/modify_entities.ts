import {IStatement} from "./_statement";
import {alt, altPrio, opt, optPrio, per, plus, plusPrio, seq, ver} from "../combi";
import {AssociationName, EntityAssociation, NamespaceSimpleName, SimpleName, Source, Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class ModifyEntities implements IStatement {

  public getMatcher(): IStatementRunnable {
    const withh = seq("WITH", Source);
    const fieldsWith = seq("FIELDS (", plus(SimpleName), ")", withh);
    const by = seq("BY", AssociationName);
    const relating = seq("RELATING TO", NamespaceSimpleName, "BY", NamespaceSimpleName);

    const operation = alt(
      seq("UPDATE SET FIELDS WITH", Source),
      seq("CREATE SET FIELDS WITH", Source),
      seq("UPDATE", fieldsWith),
      seq("DELETE FROM", Source),
      seq("UPDATE FROM", Source, opt(relating)),
      seq("CREATE", opt(by), "FROM", Source, opt(relating)),
      seq("EXECUTE", SimpleName, "FROM", Source),
      seq("CREATE", opt(by), optPrio("AUTO FILL CID"), altPrio(withh, fieldsWith)));

    const failed = seq("FAILED", Target);
    const result = seq("RESULT", Target);
    const mapped = seq("MAPPED", Target);
    const reported = seq("REPORTED", Target);
    const from = seq("FROM", Source);
    const execute = seq("EXECUTE", NamespaceSimpleName);

    const entities = seq(optPrio("AUGMENTING"), "ENTITIES OF", NamespaceSimpleName,
                         opt("IN LOCAL MODE"),
                         plusPrio(seq("ENTITY", SimpleName, plus(operation))),
                         optPrio(per(failed,
                                     result,
                                     mapped,
                                     reported)));

    const entity = seq("ENTITY", opt("IN LOCAL MODE"), alt(NamespaceSimpleName, EntityAssociation), execute, from, opt(mapped), opt(failed), opt(reported));

    return ver(Version.v754, seq("MODIFY", alt(entities, entity)));
  }

}