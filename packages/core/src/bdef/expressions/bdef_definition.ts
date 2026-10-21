import {BDEFAuthorizationContext, BDEFDefineBehavior, BDEFHeader, BDEFImplementationType} from ".";
import {altPrio, Expression, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class BDEFDefinition extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(BDEFImplementationType, starPrio(altPrio(BDEFHeader, BDEFDefineBehavior, BDEFAuthorizationContext)));
  }
}
