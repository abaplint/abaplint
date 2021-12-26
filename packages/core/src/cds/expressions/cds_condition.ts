import {CDSName, CDSString} from ".";
import {alt, Expression, opt, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSCondition extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, opt(seq(".", CDSName)));
    const eq = seq(name, alt("=", "<>", "<", ">", ">=", "<="), alt(name, CDSString));
    const isNull = seq(name, "IS NULL");
    const isNotNull = seq(name, "IS NOT NULL");
    const condition = alt(eq, isNull, isNotNull);
    const paren = seq("(", CDSCondition, ")");
    return seq(condition, star(seq(alt("AND", "OR"), alt(condition, paren))));
  }
}