import {seq, Expression} from "../combi";
import {NamespaceSimpleName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class TypeHierarchy extends Expression {
  public getRunnable(): IStatementRunnable {
    // todo, add version,
    const hier = seq("TYPE STRUCTURE FOR HIERARCHY", NamespaceSimpleName);

    return hier;
  }

}
