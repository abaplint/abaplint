import {seq, Expression, altPrio, alt} from "../combi";
import {EntityAssociation, EventName, NamespaceSimpleName, SourceField} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class TypeStructure extends Expression {
  public getRunnable(): IStatementRunnable {
    // todo, add version,
    const hier = seq("HIERARCHY", NamespaceSimpleName);
    const create = seq("CREATE", alt(NamespaceSimpleName, EntityAssociation));
    const update = seq("UPDATE", NamespaceSimpleName);
    const action = seq("ACTION IMPORT", SourceField);
    const permissionsRequest = seq("PERMISSIONS REQUEST", SourceField);
    const evt = seq("EVENT", EventName);

    return seq("TYPE STRUCTURE FOR", altPrio(hier, evt, create, update, action, permissionsRequest));
  }

}
