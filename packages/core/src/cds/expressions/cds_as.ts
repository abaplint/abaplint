import {CDSName, CDSType} from ".";
import {altPrio, Expression, regex, seq, optPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSAs extends Expression {
  public getRunnable(): IStatementRunnable {
    const redirected = seq(": REDIRECTED TO", optPrio(altPrio("PARENT", "COMPOSITION CHILD")), CDSName);
    const colonType = seq(":", altPrio(CDSType, CDSName, "LOCALIZED"));
    const ident = regex(/^\w+$/);
    const namespacedAlias = seq(ident, "/", ident, "/", ident);
    return seq("AS", altPrio(namespacedAlias, CDSName), optPrio(altPrio(redirected, colonType)));
  }
}
