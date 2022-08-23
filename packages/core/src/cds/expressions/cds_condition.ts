import {CDSFunction, CDSName, CDSString} from ".";
import {alt, Expression, opt, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSCondition extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, opt(seq(".", alt(CDSName, CDSString))));
    const eq = seq(name, alt("=", "!=", "<>", "<", ">", ">=", "<=", "LIKE", "NOT LIKE"), alt(name, CDSFunction, CDSString));
    const isInitial = seq(name, "IS INITIAL");
    const isNotInitial = seq(name, "IS NOT INITIAL");
    const isNull = seq(name, "IS NULL");
    const isNotNull = seq(name, "IS NOT NULL");
    const condition = alt(eq, isNull, isNotNull, isInitial, isNotInitial);
    const paren = seq("(", CDSCondition, ")");
    return seq(alt(condition, paren), star(seq(alt("AND", "OR"), alt(condition, paren))));
  }
}