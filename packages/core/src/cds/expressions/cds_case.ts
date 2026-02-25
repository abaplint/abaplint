import {CDSAggregate, CDSArithParen, CDSArithmetics, CDSCast, CDSCondition, CDSFunction, CDSInteger, CDSPrefixedName, CDSString} from ".";
import {altPrio, Expression, optPrio, plusPrio, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSCase extends Expression {
  public getRunnable(): IStatementRunnable {
    // CDSArithmetics first: handles cast()*n, sum()*n, field+n, etc. before standalone alternatives
    const value = altPrio(CDSString, CDSCase, CDSArithmetics, CDSCast,
                          CDSAggregate, CDSArithParen, CDSFunction, CDSInteger, CDSPrefixedName);
    const simple = seq(altPrio(CDSArithmetics, CDSArithParen, CDSFunction, CDSPrefixedName), plusPrio(seq("WHEN", value, "THEN", value)));
    const complex = plusPrio(seq("WHEN", CDSCondition, "THEN", value));
    return seq("CASE", altPrio(complex, simple), optPrio(seq("ELSE", value)), "END");
  }
}