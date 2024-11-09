import {seq, Expression, altPrio} from "../combi";
import {EventName, NamespaceSimpleName, SourceField} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class TypeStructure extends Expression {
  public getRunnable(): IStatementRunnable {
    // todo, add version,
    const hier = seq("HIERARCHY", NamespaceSimpleName);
    const create = seq("CREATE", NamespaceSimpleName);
    const update = seq("UPDATE", NamespaceSimpleName);
    const action = seq("ACTION IMPORT", SourceField);
    const evt = seq("EVENT", EventName);

    return seq("TYPE STRUCTURE FOR", altPrio(hier, evt, create, update, action));
  }

}
