import {seq, Expression, altPrio, alt} from "../combi";
import {EntityAssociation, EventName, NamespaceSimpleName, Source} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class TypeStructure extends Expression {
  public getRunnable(): IStatementRunnable {
    // todo, add version,
    const hier = seq("HIERARCHY", NamespaceSimpleName);
    const create = seq("CREATE", alt(NamespaceSimpleName, EntityAssociation));
    const update = seq("UPDATE", alt(NamespaceSimpleName, EntityAssociation));
    const readResult = seq("READ RESULT", alt(NamespaceSimpleName, EntityAssociation));
    const action = seq("ACTION IMPORT", Source);
    const permissionsRequest = seq("PERMISSIONS REQUEST", NamespaceSimpleName);
    const evt = seq("EVENT", EventName);

    const failedEarly = seq("FAILED EARLY", NamespaceSimpleName);
    const mappedEarly = seq("MAPPED EARLY", NamespaceSimpleName);
    const reportedEarly = seq("REPORTED EARLY", NamespaceSimpleName);

    const structure = seq("STRUCTURE FOR", altPrio(hier, evt, create, update, action, permissionsRequest, readResult));
    const response = seq("RESPONSE FOR", altPrio(failedEarly, mappedEarly, reportedEarly));

    return seq("TYPE", altPrio(structure, response));
  }

}
