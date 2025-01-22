import {CDSFunction, CDSName, CDSString} from ".";
import {altPrio, Expression, optPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSInteger} from "./cds_integer";

export class CDSCondition extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, optPrio(seq(".", altPrio(CDSString, CDSName))));
    const left = altPrio(CDSString, CDSFunction, name);
    const operators = altPrio("=", seq("!", "="), seq("<", ">"), seq(">", "="), seq("<", "="), "<", ">", "LIKE", "NOT LIKE");
    const compare = seq(operators, altPrio(left, CDSInteger));
    const is = seq("IS", optPrio("NOT"), altPrio("INITIAL", "NULL"));
    const between = seq("BETWEEN", left, "AND", left);
    const condition = seq(optPrio("NOT"), left, altPrio(compare, is, between));
    const paren = seq("(", CDSCondition, ")");
    return seq(altPrio(condition, paren), starPrio(seq(altPrio("AND", "OR"), altPrio(condition, paren))));
  }
}