import {CDSFunction, CDSName, CDSString} from ".";
import {alt, Expression, opt, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSInteger} from "./cds_integer";

export class CDSCondition extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, opt(seq(".", alt(CDSName, CDSString))));
    const left = alt(name, CDSFunction);
    const eq = seq(left, alt("=", seq("!", "="), seq("<", ">"), "<", ">", seq(">", "="), seq("<", "="), "LIKE", "NOT LIKE"), alt(left, CDSInteger, CDSFunction, CDSString));
    const isInitial = seq(left, "IS INITIAL");
    const isNotInitial = seq(left, "IS NOT INITIAL");
    const isNull = seq(left, "IS NULL");
    const isNotNull = seq(left, "IS NOT NULL");
    const condition = alt(eq, isNull, isNotNull, isInitial, isNotInitial);
    const paren = seq("(", CDSCondition, ")");
    return seq(alt(condition, paren), star(seq(alt("AND", "OR"), alt(condition, paren))));
  }
}