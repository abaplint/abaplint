import {seq, Expression, altPrio} from "../combi";
import {EventName, NamespaceSimpleName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class TypeStructure extends Expression {
  public getRunnable(): IStatementRunnable {
    // todo, add version,
    const hier = seq("HIERARCHY", NamespaceSimpleName);
    const evt = seq("EVENT", EventName);

    return seq("TYPE STRUCTURE FOR", altPrio(hier, evt));
  }

}
