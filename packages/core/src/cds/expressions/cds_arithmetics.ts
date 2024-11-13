import {CDSCase, CDSCast, CDSFunction, CDSName, CDSString} from ".";
import {alt, altPrio, Expression, opt, plus, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSInteger} from "./cds_integer";

export class CDSArithmetics extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, opt(seq(".", CDSName)));
    const val = alt(CDSInteger, name, CDSFunction, CDSCase, CDSCast, CDSString);
    const operator = altPrio("+", "-", "*", "/");

    const operatorValue = seq(operator, val);
    const paren = seq("(", val, plus(operatorValue), ")");
    const noParen = seq(val, plus(operatorValue));
    // todo: this is pretty bad, it needs a rewrite
    return altPrio(seq(paren, plus(operatorValue)), paren, noParen);
  }
}