import {CDSSource} from ".";
import {altPrio, Expression, optPrio, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSCondition} from "./cds_condition";

export class CDSJoin extends Expression {
  public getRunnable(): IStatementRunnable {
    const joinTypes = optPrio(altPrio(
      "LEFT OUTER MANY TO EXACT ONE", "LEFT OUTER ONE TO EXACT ONE", "LEFT OUTER ONE TO MANY",
      "LEFT OUTER TO ONE", "LEFT OUTER TO MANY", "LEFT OUTER",
      "INNER ONE TO MANY", "INNER MANY TO ONE", "INNER ONE TO EXACT ONE", "INNER MANY TO EXACT ONE",
      "INNER TO MANY", "INNER TO ONE", "INNER TO EXACT ONE",
      "INNER", "CROSS", "RIGHT OUTER",
    ));
    const cond = seq(CDSSource, "ON", CDSCondition);
    const foo = altPrio(seq("(", cond, ")"), cond);
    // Parenthesized join sub-expression: JOIN (src innerJOIN src ON cond) ON outerCond
    const innerJoin = seq(joinTypes, "JOIN", altPrio(seq("(", cond, ")"), cond));
    const parenJoinChain = seq("(", CDSSource, star(innerJoin), ")", "ON", CDSCondition);
    return seq(joinTypes, "JOIN", altPrio(parenJoinChain, foo, CDSSource));
  }
}