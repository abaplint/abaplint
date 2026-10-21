import {BDEFName, BDEFOptions, BDEFString} from ".";
import {altPrio, Expression, optPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** eg. "define own authorization context { 'S_TABU_NAM'; }" or "define own authorization context by privileged mode;" */
export class BDEFAuthorizationContext extends Expression {
  public getRunnable(): IStatementRunnable {
    const item = seq(altPrio(BDEFString, BDEFName), ";");
    const body = seq("{", starPrio(item), "}", optPrio(";"));
    const privileged = seq("BY PRIVILEGED MODE", optPrio("AND"));

    return seq(
      "DEFINE",
      optPrio("OWN"),
      "AUTHORIZATION CONTEXT",
      optPrio(altPrio(privileged, BDEFName)),
      optPrio(seq("FOR DISABLE", BDEFOptions)),
      altPrio(";", body));
  }
}
