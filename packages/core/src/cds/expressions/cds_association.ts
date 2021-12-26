import {CDSName, CDSString} from ".";
import {alt, Expression, seq, opt, plus, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSAssociation extends Expression {
  public getRunnable(): IStatementRunnable {
    const cardinality = seq("[", alt("0", "1"), opt(seq(".", ".", alt("0", "1", "*"))), "]");
    const as = seq("AS", CDSName);
    const name = seq(CDSName, plus(seq(".", CDSName)));
    const cond = seq(name, "=", alt(name, CDSString));
    const and = seq("AND", cond);
    return seq("ASSOCIATION", cardinality, "TO", CDSName, opt(as), "ON", cond, star(and));
  }
}