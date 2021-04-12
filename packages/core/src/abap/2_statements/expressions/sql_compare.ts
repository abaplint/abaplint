import {ver, seq, opt, tok, star, alt, optPrio, altPrio, Expression} from "../combi";
import {SQLSource, SQLFieldName, Dynamic, Select, SQLCompareOperator} from ".";
import {WParenLeft, WParenLeftW, ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SQLCompare extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = new SQLSource();

    const list = seq(altPrio(tok(WParenLeft), tok(WParenLeftW)), val, star(seq(",", val)), ")");

    const subSelect = seq("(", Select, ")");

    const inn = seq(opt("NOT"),
                    "IN",
                    altPrio(SQLSource, list, subSelect));

    const between = seq(opt("NOT"), "BETWEEN", SQLSource, "AND", SQLSource);

    const like = seq(opt("NOT"), "LIKE", SQLSource, optPrio(seq("ESCAPE", SQLSource)));

    const nul = seq("IS", opt("NOT"), alt("NULL", ver(Version.v753, "INITIAL")));

    const source = new SQLSource();

    const sub = seq(optPrio(altPrio("ALL", "ANY", "SOME")), subSelect);

    const builtin = ver(Version.v751, seq(alt("lower", "upper"), tok(ParenLeftW), SQLFieldName, tok(WParenRightW)));

    const rett = seq(alt(SQLFieldName, builtin),
                     alt(seq(SQLCompareOperator, alt(source, sub)),
                         inn,
                         like,
                         between,
                         nul));

    const ret = rett;

    const exists = seq("EXISTS", subSelect);

    return altPrio(exists, Dynamic, ret);
  }
}