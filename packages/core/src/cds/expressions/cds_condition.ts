import {CDSAggregate, CDSArithParen, CDSArithmetics, CDSFunction, CDSPrefixedName, CDSString} from ".";
import {altPrio, Expression, opt, optPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSInteger} from "./cds_integer";

export class CDSCondition extends Expression {
  public getRunnable(): IStatementRunnable {
    const left = altPrio(CDSString, CDSFunction, CDSAggregate, CDSPrefixedName);
    const nonLikeOperators = altPrio("=", seq("!", "="), seq("<", ">"), seq(">", "="), seq("<", "="), "<", ">");
    const likeOperators = altPrio("LIKE", "NOT LIKE");
    // Right side of comparison: simple values first, then parenthesized, then full arithmetic last.
    // CDSArithmetics is last to avoid triggering CDSPrefixedName→CDSCondition→CDSArithmetics cycle.
    const right = altPrio(CDSArithParen, left, CDSInteger, CDSArithmetics);
    // ESCAPE is only valid with LIKE/NOT LIKE, not with other comparison operators.
    const compare = altPrio(seq(likeOperators, right, opt(seq("ESCAPE", CDSString))), seq(nonLikeOperators, right));
    const is = seq("IS", optPrio("NOT"), altPrio("INITIAL", "NULL"));
    const between = seq("BETWEEN", left, "AND", left);
    const condition = seq(optPrio("NOT"), left, altPrio(compare, is, between));
    const paren = seq("(", CDSCondition, ")");
    const notParen = seq("NOT", paren);
    return seq(altPrio(condition, notParen, paren), starPrio(seq(altPrio("AND", "OR"), altPrio(condition, notParen, paren))));
  }
}