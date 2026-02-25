import {CDSAggregate, CDSArithParen, CDSArithmetics, CDSCase, CDSCast, CDSFunction, CDSInteger, CDSPrefixedName, CDSString} from ".";
import {altPrio, Expression} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSFunctionInput extends Expression {
  public getRunnable(): IStatementRunnable {
    const input = altPrio(CDSArithmetics, CDSArithParen, CDSAggregate, CDSCast,
                          CDSFunction, CDSCase, CDSString, CDSPrefixedName, CDSInteger);

    return input;
  }
}