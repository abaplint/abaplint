import {vers, seq, opts, tok, stars, alts, optPrios, Expression} from "../combi";
import {SQLSource, SQLFieldName, Dynamic, Select, SQLCompareOperator} from ".";
import {WParenLeft, WParenLeftW, ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SQLCompare extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = new SQLSource();

    const list = seq(alts(tok(WParenLeft), tok(WParenLeftW)), val, stars(seq(",", val)), ")");

    const subSelect = seq("(", Select, ")");

    const inn = seq(opts("NOT"),
                    "IN",
                    alts(SQLSource, list, subSelect));

    const between = seq("BETWEEN", SQLSource, "AND", SQLSource);

    const like = seq(opts("NOT"), "LIKE", SQLSource, optPrios(seq("ESCAPE", SQLSource)));

    const nul = seq("IS", opts("NOT"), alts("NULL", vers(Version.v753, "INITIAL")));

    const source = new SQLSource();

    const sub = seq(opts(alts("ALL", "ANY", "SOME")), subSelect);

    const builtin = vers(Version.v751, seq(alts("lower", "upper"), tok(ParenLeftW), SQLFieldName, tok(WParenRightW)));

    const rett = seq(alts(SQLFieldName, builtin),
                     alts(seq(SQLCompareOperator, alts(source, sub)),
                          inn,
                          like,
                          between,
                          nul));

    const ret = rett;

    const exists = seq("EXISTS", subSelect);

    return alts(ret, Dynamic, exists);
  }
}