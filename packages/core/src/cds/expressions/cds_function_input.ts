import {CDSAggregate, CDSArithParen, CDSArithmetics, CDSCase, CDSCast, CDSFunction, CDSInteger, CDSName, CDSPrefixedName, CDSString} from ".";
import {altPrio, Expression, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSFunctionInput extends Expression {
  public getRunnable(): IStatementRunnable {
    const positional = altPrio(CDSArithmetics, CDSArithParen, CDSAggregate, CDSCast,
                               CDSFunction, CDSCase, CDSString, CDSPrefixedName, CDSInteger);
    const named = seq(CDSName, "=", ">", positional);
    return altPrio(named, positional);
  }
}
