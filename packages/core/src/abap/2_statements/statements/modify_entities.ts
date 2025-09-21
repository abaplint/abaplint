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

    const execute = seq("EXECUTE", NamespaceSimpleName, "FROM", Source);
    const create = seq("CREATE", opt(by), "FROM", Source, opt(relating));
    const updateFrom = seq("UPDATE FROM", Source, opt(relating));
    const deleteFrom = seq("DELETE FROM", Source);
    const updateFields = seq("UPDATE", fieldsWith);

    const operation = alt(
      seq("UPDATE SET FIELDS WITH", Source),
      seq("CREATE SET FIELDS WITH", Source),
      updateFields,
      deleteFrom,
      updateFrom,
      create,
      execute,
      seq("CREATE", opt(by), optPrio("AUTO FILL CID"), altPrio(withh, fieldsWith)));

    const failed = seq("FAILED", Target);
    const result = seq("RESULT", Target);
    const mapped = seq("MAPPED", Target);
    const reported = seq("REPORTED", Target);

    const end = optPrio(per(failed,
                            result,
                            mapped,
                            reported));

    const entities = seq(optPrio("AUGMENTING"), "ENTITIES OF", NamespaceSimpleName,
                         opt("IN LOCAL MODE"),
                         plusPrio(seq("ENTITY", NamespaceSimpleName, plus(operation))));

    const create2 = seq("CREATE", fieldsWith, "CREATE BY", AssociationName, fieldsWith);
    const create3 = seq("CREATE BY", AssociationName, fieldsWith);

    const entity = seq("ENTITY",
                       opt("IN LOCAL MODE"),
                       alt(NamespaceSimpleName, EntityAssociation),
                       alt(execute, create, updateFields, deleteFrom, updateFrom, create2, create3));

    return ver(Version.v754, seq("MODIFY", alt(entities, entity), end));
  }

}