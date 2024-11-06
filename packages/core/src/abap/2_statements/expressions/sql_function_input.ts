import {Constant} from "./constant";
import {Version} from "../../../version";
import {ParenLeftW, WAt, WParenRightW} from "../../1_lexer/tokens";
import {Expression, ver, seq, tok, altPrio, starPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLAliasField} from "./sql_alias_field";
import {SQLFieldName} from "./sql_field_name";
import {SimpleSource3} from "./simple_source3";
import {Source} from "./source";
import {SQLAggregation} from "./sql_aggregation";
import {SQLFunction} from "./sql_function";

export class SQLFunctionInput extends Expression {
  public getRunnable(): IStatementRunnable {
    const paren = seq(tok(ParenLeftW), Source, tok(WParenRightW));
    const at = ver(Version.v740sp05, seq(tok(WAt), altPrio(SimpleSource3, paren)));

    const param = altPrio(SQLFunction, SQLAggregation, SQLFieldName, SQLAliasField, Constant, at);

    const operator = altPrio("+", "-", "*", "/", "&&");

    return seq(param, starPrio(seq(operator, param)));
  }
}