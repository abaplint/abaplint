import {CDSArithParen, CDSArithmetics, CDSCase, CDSCast, CDSFunction, CDSPrefixedName, CDSString, CDSType} from ".";
import {altPrio, Expression, opt, optPrio, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSAggregate extends Expression {
  public getRunnable(): IStatementRunnable {
    const fieldAsType = seq(CDSPrefixedName, "AS", CDSType);
    const funcAsType = seq(CDSFunction, "AS", CDSType);
    const value = altPrio(CDSArithmetics, CDSArithParen, CDSCast, CDSCase, funcAsType, CDSFunction, fieldAsType, CDSPrefixedName, CDSString, "*");
    return seq(altPrio("MAX", "MIN", "SUM", "AVG", "COUNT"), "(", optPrio(altPrio("DISTINCT", "ALL")), value, opt(seq("AS", CDSType)), ")");
  }
}
