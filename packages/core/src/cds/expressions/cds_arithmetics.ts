import {CDSAggregate, CDSArithParen, CDSCase, CDSCast, CDSFunction, CDSPrefixedName, CDSString} from ".";
import {altPrio, Expression, plusPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSInteger} from "./cds_integer";

/**
 * Arithmetic expression: one or more values joined by +, -, *, /.
 *
 * Parenthesized sub-expressions of any nesting depth are handled via the
 * separate CDSArithParen singleton (which wraps back to CDSArithmetics).
 * The mutual reference between two distinct singletons enables true n-level
 * nesting with no fixed limit and no infinite recursion.
 *
 * Grammar (simplified):
 *   CDSArithmetics  →  operand (op operand)+          -- with-operator form
 *                    | unary val                       -- unary form
 *                    | unary val (op operand)+         -- unary + continuation
 *                    | unary CDSArithParen             -- unary applied to paren, e.g. -(field)
 *                    | unary CDSArithParen (op op)+    -- unary paren + continuation
 *   operand         →  CDSArithParen | val
 *   CDSArithParen   →  "(" CDSArithmetics ")" | "(" CDSArithParen ")" | "(" val ")"
 */
export class CDSArithmetics extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = altPrio(CDSInteger, CDSFunction, CDSCase, CDSCast, CDSString, CDSAggregate, CDSPrefixedName);
    const operator = altPrio("+", "-", "*", "/");

    // Unary operator prefix, e.g. -field, +field
    const unary = altPrio("-", "+");
    const unaryExpression = seq(unary, val);

    // An operand is a paren, unary-prefixed value, or bare value.
    // Including unaryExpression allows "A + + B" and "A + -B" patterns.
    // CDSArithParen = "(" altPrio(CDSArithmetics, CDSArithParen, val) ")" — separate singleton that
    // can recursively contain itself, enabling deeply nested parentheses without infinite recursion.
    const operand = altPrio(CDSArithParen, unaryExpression, val);
    const operatorValue = seq(operator, operand);

    // Main form: operand op operand op ... (leading term may itself be a paren)
    const withOperators = seq(operand, plusPrio(operatorValue));

    // Unary followed by optional continuation operators: -1 * field, -field + 1
    const unaryWithOps = seq(unaryExpression, plusPrio(operatorValue));

    // Top-level parenthesized expression as a standalone field value: (A + B) * C
    const parenExpr = altPrio(withOperators, unaryExpression);
    const paren = seq("(", parenExpr, ")");

    // Unary applied to a parenthesized group, e.g. -(TaxAmount)
    const unaryParen = seq(unary, CDSArithParen);

    return altPrio(
      seq(paren, starPrio(operatorValue)),        // (expr) op ...
      seq(unaryParen, starPrio(operatorValue)),   // -(paren) op ...
      unaryWithOps,                               // -val op ...
      unaryExpression,                            // -val
      unaryParen,                                 // -(paren)
      withOperators,                              // operand op operand ...
    );
  }
}
