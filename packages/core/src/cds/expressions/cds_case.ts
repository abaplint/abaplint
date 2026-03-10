import {CDSAggregate, CDSArithParen, CDSArithmetics, CDSCast, CDSCondition, CDSFunction, CDSInteger, CDSPrefixedName, CDSString} from ".";
import {altPrio, Expression, optPrio, plusPrio, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSCase extends Expression {
  public getRunnable(): IStatementRunnable {
    // caseParen: explicit "( case ... end )" alternative placed BEFORE CDSArithmetics.
    // This avoids CDSArithmetics trying ( case ... end ) as an operand (partial match + fail),
    // which causes 2^N backtracking for N levels of nested parenthesized CASE expressions.
    // CDSArithmetics is still tried after for arithmetic like (-1)*Amount or (2*A)-B.
    const caseParen = seq("(", CDSCase, ")");
    const value = altPrio(CDSString, CDSCase, caseParen, CDSArithmetics, CDSCast,
                          CDSAggregate, CDSArithParen, CDSFunction, CDSInteger, CDSPrefixedName);
    const simple = seq(altPrio(CDSArithmetics, CDSArithParen, CDSAggregate, CDSFunction, CDSPrefixedName), plusPrio(seq("WHEN", value, "THEN", value)));
    const complex = plusPrio(seq("WHEN", CDSCondition, "THEN", value));
    return seq("CASE", altPrio(complex, simple), optPrio(seq("ELSE", value)), "END");
  }
}