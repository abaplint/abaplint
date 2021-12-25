import {CDSName} from ".";
import {alt, Expression, seq, opt, plus} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSAssociation extends Expression {
  public getRunnable(): IStatementRunnable {
    const cardinality = seq("[", alt("0", "1"), ".", ".", alt("0", "1", "*"), "]");
    const as = seq("AS", CDSName);
    const name = seq(CDSName, plus(seq(".", CDSName)));
    return seq("ASSOCIATION", cardinality, "TO", CDSName, opt(as), "ON", name, "=", name);
  }
}