import {CDSAggregate, CDSArithParen, CDSArithmetics, CDSCast, CDSFunction, CDSPrefixedName, CDSString} from ".";
import {altPrio, Expression, optPrio, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSInteger} from "./cds_integer";

export class CDSCondition extends Expression {
  public getRunnable(): IStatementRunnable {
    // CDSArithmetics before CDSPrefixedName so A - B > C is handled as arithmetic comparison
    const left = altPrio(CDSString, CDSCast, CDSFunction, CDSAggregate, CDSArithmetics, CDSArithParen, CDSPrefixedName);
    const nonLikeOperators = altPrio("=", seq("!", "="), seq("<", ">"), seq(">", "="), seq("<", "="), "<", ">");
    const likeOperators = altPrio("LIKE", "NOT LIKE");
    // Right side of comparison: simple values first, then parenthesized, then full arithmetic last.
    // CDSArithmetics is last to avoid triggering CDSPrefixedName→CDSCondition→CDSArithmetics cycle.
    const right = altPrio(CDSArithParen, left, CDSInteger, CDSArithmetics);
    // ESCAPE is only valid with LIKE/NOT LIKE, not with other comparison operators.
    const compare = altPrio(seq(likeOperators, right, optPrio(seq("ESCAPE", CDSString))), seq(nonLikeOperators, right));
    const is = seq("IS", optPrio("NOT"), altPrio("INITIAL", "NULL"));
    const between = seq(altPrio("NOT BETWEEN", "BETWEEN"), left, "AND", left);
    const condition = seq(optPrio("NOT"), left, altPrio(compare, is, between));
    const paren = seq("(", CDSCondition, ")");
    const notParen = seq("NOT", paren);
    return seq(altPrio(condition, notParen, paren), star(seq(altPrio("AND", "OR"), altPrio(condition, notParen, paren))));
  }
}
