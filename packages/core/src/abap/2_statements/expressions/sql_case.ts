import {SimpleSource3, SQLAggregation, SQLFunction, SQLPath} from ".";
import {Version} from "../../../version";
import {WAt, WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Expression, ver, seq, tok, optPrio, opt, altPrio, starPrio, plusPrio} from "../combi";
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

    const sourc = altPrio(SQLCase, SQLAggregation, SQLFunction, SQLSource, Constant);
    const val = altPrio(SQLCond, Constant, seq(tok(WAt), SimpleSource3));
    const when = seq("WHEN", val, "THEN", sourc, starPrio(sub));
    const els = seq("ELSE", sourc);

    return ver(Version.v740sp05, seq("CASE", opt(SQLFieldName), plusPrio(when), optPrio(els), "END"));
  }
}