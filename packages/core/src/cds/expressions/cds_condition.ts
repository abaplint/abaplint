import {CDSFunction, CDSName, CDSString} from ".";
import {alt, altPrio, Expression, opt, optPrio, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSInteger} from "./cds_integer";

export class CDSCondition extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, opt(seq(".", alt(CDSName, CDSString))));
    const left = alt(name, CDSFunction);
    const compare = seq(left, alt("=", seq("!", "="), seq("<", ">"), "<", ">", seq(">", "="), seq("<", "="), "LIKE", "NOT LIKE"), alt(left, CDSInteger, CDSFunction, CDSString));
    const is = seq(left, "IS", optPrio("NOT"), altPrio("INITIAL", "NULL"));
    const condition = alt(compare, is);
    const paren = seq("(", CDSCondition, ")");
    return seq(alt(condition, paren), star(seq(alt("AND", "OR"), alt(condition, paren))));
  }
}