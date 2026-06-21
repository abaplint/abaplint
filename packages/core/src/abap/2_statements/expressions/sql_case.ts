import {SimpleFieldChain2, SQLAggregation, SQLFunction, SQLPathForColumn} from ".";
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
    const abap = seq(tok(WAt), SimpleFieldChain2);

    const field = altPrio(SQLAggregation,
                          SQLCase,
                          SQLFunction,
                          SQLPathForColumn,
                          SQLFieldName,
                          Constant);
    const sub = seq(altPrio("+", "-", "*", "/", "&&"), optPrio(tok(WParenLeftW)), field, optPrio(tok(WParenRightW)));

    const source = altPrio(SQLCase, SQLAggregation, SQLFunction, SQLFieldName, SQLSource, Constant);
    const parenSource = seq(tok(WParenLeftW), source, tok(WParenRightW));
    const val = altPrio(SQLCond, Constant, abap);
    const when = seq("WHEN", val, "THEN", altPrio(parenSource, seq(optPrio("-"), source)), starPrio(sub));
    const else_ = seq("ELSE", altPrio(parenSource, seq(optPrio("-"), source)));

    return ver(Version.v740sp05, seq("CASE", opt(altPrio(SQLFieldName, abap)), plusPrio(when), optPrio(else_), "END"), Version.OpenABAP);
  }
}