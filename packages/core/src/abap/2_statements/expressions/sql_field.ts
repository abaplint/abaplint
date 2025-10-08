import {plusPrio, seq, ver, tok, Expression, optPrio, altPrio} from "../combi";
import {Constant, SQLFieldName, SQLAggregation, SQLCase, SQLAsName, SimpleFieldChain2, SQLCast} from ".";
import {Version} from "../../../version";
import {WAt, WParenLeftW, WParenRight, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {SQLFunction} from "./sql_function";
import {SQLPath} from "./sql_path";

export class SQLField extends Expression {
  public getRunnable(): IStatementRunnable {

    const abap = ver(Version.v740sp05, seq(tok(WAt), SimpleFieldChain2), Version.OpenABAP);

    const as = seq("AS", SQLAsName);

    const paren = seq(tok(WParenLeftW), SQLFieldName, altPrio(tok(WParenRightW), tok(WParenRight)));

    const field = altPrio(SQLAggregation,
                          SQLCase,
                          SQLCast,
                          SQLFunction,
                          SQLPath,
                          SQLFieldName,
                          abap,
                          Constant,
                          paren);
    const sub = plusPrio(seq(altPrio("+", "-", "*", "/", "&&"), optPrio(tok(WParenLeftW)), field, optPrio(tok(WParenRightW))));
    const arith = ver(Version.v740sp05, sub);

    return seq(field, optPrio(arith), optPrio(as));
  }
}