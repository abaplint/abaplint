import {CDSFunction, CDSName, CDSString} from ".";
import {alt, altPrio, Expression, optPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSInteger} from "./cds_integer";

export class CDSCondition extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, optPrio(seq(".", altPrio(CDSString, CDSName))));
    const left = altPrio(CDSString, CDSFunction, name);
    const compare = seq(left, alt("=", seq("!", "="), seq("<", ">"), "<", ">", seq(">", "="), seq("<", "="), "LIKE", "NOT LIKE"), alt(left, CDSInteger));
    const is = seq(left, "IS", optPrio("NOT"), altPrio("INITIAL", "NULL"));
    const condition = seq(optPrio("NOT"), altPrio(compare, is));
    const paren = seq("(", CDSCondition, ")");
    return seq(altPrio(condition, paren), starPrio(seq(altPrio("AND", "OR"), altPrio(condition, paren))));
  }
}