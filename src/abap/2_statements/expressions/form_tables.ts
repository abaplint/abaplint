import {seq, str, plus, altPrio, Expression, IStatementRunnable} from "../combi";
import {SimpleName, NamespaceSimpleName, FormParam} from ".";

export class FormTables extends Expression {
  public getRunnable(): IStatementRunnable {
    const stru = seq(new SimpleName(),
                     str("STRUCTURE"),
                     new NamespaceSimpleName());

    return seq(str("TABLES"), plus(altPrio(stru, new FormParam())));
  }
}