import {ver, seq, tok, starPrio, alt, optPrio, altPrio, Expression, plusPrio} from "../combi";
import {SQLSource, SQLFieldName, Dynamic, Select, SQLCompareOperator} from ".";
import {WParenLeft, WParenLeftW, ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SQLCompare extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = new SQLSource();

    const list = seq(altPrio(tok(WParenLeft), tok(WParenLeftW)), val, starPrio(seq(",", val)), ")");

    const subSelect = seq("(", Select, ")");

    const inn = seq(optPrio("NOT"),
                    "IN",
                    altPrio(SQLSource, list, subSelect));

    const between = seq(optPrio("NOT"), "BETWEEN", SQLSource, "AND", SQLSource);

    const like = seq(optPrio("NOT"), "LIKE", SQLSource, optPrio(seq("ESCAPE", SQLSource)));

    const nul = seq("IS", optPrio("NOT"), alt("NULL", ver(Version.v753, "INITIAL")));

    const source = new SQLSource();

    const sub = seq(optPrio(altPrio("ALL", "ANY", "SOME")), subSelect);

    const builtin = ver(Version.v751, seq(alt("lower", "upper"), tok(ParenLeftW), SQLFieldName, tok(WParenRightW)));

    const arith = ver(Version.v750, seq(SQLFieldName, plusPrio(seq(altPrio("+", "-"), SQLFieldName))));

    const rett = seq(altPrio(builtin, arith, SQLFieldName),
                     altPrio(seq(SQLCompareOperator, altPrio(sub, source)),
                             inn,
                             like,
                             between,
                             nul));

    const exists = seq("EXISTS", subSelect);

    return altPrio(exists, Dynamic, rett);
  }
}