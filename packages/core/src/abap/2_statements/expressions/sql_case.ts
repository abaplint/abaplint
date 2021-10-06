import {SQLAggregation, SQLFunction, SQLPath} from ".";
import {Version} from "../../../version";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Expression, ver, alt, seq, plus, tok, optPrio, opt, altPrio, starPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Constant} from "./constant";
import {SQLCond} from "./sql_cond";
import {SQLFieldName} from "./sql_field_name";
import {SQLSource} from "./sql_source";

export class SQLCase extends Expression {
  public getRunnable(): IStatementRunnable {

    const field = altPrio(SQLAggregation,
                          SQLCase,
                          SQLFunction,
                          SQLPath,
                          SQLFieldName,
                          Constant);
    const sub = seq(altPrio("+", "-", "*", "/", "&&"), optPrio(tok(WParenLeftW)), field, optPrio(tok(WParenRightW)));

    const when = seq("WHEN", alt(Constant, SQLCond), "THEN", altPrio(SQLAggregation, SQLFunction, SQLSource), starPrio(sub));
    const els = seq("ELSE", SQLSource);

    return ver(Version.v740sp05, seq("CASE", opt(SQLFieldName), plus(when), optPrio(els), "END"));
  }
}