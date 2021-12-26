import {CDSName, CDSString} from ".";
import {alt, Expression, opt, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSCondition extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, opt(seq(".", CDSName)));
    const condition = seq(name, "=", alt(name, CDSString));
    const paren = seq("(", CDSCondition, ")");
    return seq(condition, star(seq(alt("AND", "OR"), alt(condition, paren))));
  }
}