import {CDSCase, CDSCast, CDSFunction, CDSName, CDSString} from ".";
import {altPrio, Expression, optPrio, plusPrio, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSInteger} from "./cds_integer";

export class CDSArithmetics extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, optPrio(seq(".", CDSName)));
    const val = altPrio(CDSInteger, CDSFunction, CDSCase, CDSCast, CDSString, name);
    const operator = altPrio("+", "-", "*", "/");

    const operatorValue = seq(operator, val);
    const paren = seq("(", val, plusPrio(operatorValue), ")");
    const noParen = seq(val, plusPrio(operatorValue));
    // todo: this is pretty bad, it needs a rewrite
    return altPrio(seq(paren, plusPrio(operatorValue)), paren, noParen);
  }
}