import {CDSSource} from ".";
import {altPrio, Expression, optPrio, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSCondition} from "./cds_condition";

export class CDSJoin extends Expression {
  public getRunnable(): IStatementRunnable {
    const cardSide = altPrio("EXACT ONE", "ONE", "MANY");
    // LEFT OUTER [card TO card] — structured to cover all combinations
    const leftOuterCard = seq("LEFT OUTER", cardSide, "TO", cardSide);
    const leftOuterToCard = seq("LEFT OUTER TO", altPrio("EXACT ONE", "ONE", "MANY"));
    // INNER [card TO card]
    const innerCard = seq("INNER", cardSide, "TO", cardSide);
    const innerToCard = seq("INNER TO", altPrio("EXACT ONE", "ONE", "MANY"));
    const joinTypes = optPrio(altPrio(
      leftOuterCard, leftOuterToCard, "LEFT OUTER",
      innerCard, innerToCard, "INNER",
      "CROSS", "RIGHT OUTER",
    ));
    const cond = seq(CDSSource, "ON", CDSCondition);
    const foo = altPrio(seq("(", cond, ")"), cond);
    // Parenthesized join sub-expression: JOIN (src innerJOIN src ON cond) ON outerCond
    const innerJoin = seq(joinTypes, "JOIN", altPrio(seq("(", cond, ")"), cond));
    const parenJoinChain = seq("(", CDSSource, star(innerJoin), ")", "ON", CDSCondition);
    // Inline nested join: JOIN src [JOIN src ON cond]* ON outerCond
    const inlineChain = seq(CDSSource, star(seq(joinTypes, "JOIN", CDSSource, "ON", CDSCondition)), "ON", CDSCondition);
    return seq(joinTypes, "JOIN", altPrio(parenJoinChain, inlineChain, foo, CDSSource));
  }
}