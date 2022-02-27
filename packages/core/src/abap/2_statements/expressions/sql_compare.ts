import {ver, seq, tok, starPrio, optPrio, altPrio, Expression, plusPrio} from "../combi";
import {SQLSource, SQLFieldName, Dynamic, Select, SQLCompareOperator, SQLFunction} from ".";
import {WParenLeft, WParenLeftW} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SQLCompare extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = new SQLSource();

    const list = seq(altPrio(tok(WParenLeft), tok(WParenLeftW)), val, starPrio(seq(",", val)), ")");

    const subSelect = seq("(", Select, ")");

    const inn = seq("IN", altPrio(SQLSource, list, subSelect));

    const between = seq("BETWEEN", SQLSource, "AND", SQLSource);

    const like = seq("LIKE", SQLSource, optPrio(seq("ESCAPE", SQLSource)));


    const nul = seq("IS", optPrio("NOT"), altPrio("NULL", ver(Version.v753, "INITIAL")));

    const source = new SQLSource();

    const sub = seq(optPrio(altPrio("ALL", "ANY", "SOME")), subSelect);

    const arith = ver(Version.v750, plusPrio(seq(altPrio("+", "-", "*", "/"), SQLFieldName)));

    const rett = seq(altPrio(SQLFunction, seq(SQLFieldName, optPrio(arith))),
                     altPrio(seq(SQLCompareOperator, altPrio(sub, source)),
                             seq(optPrio("NOT"), altPrio(inn, like, between)),
                             nul));

    const exists = seq("EXISTS", subSelect);

    return altPrio(exists, Dynamic, rett);
  }
}