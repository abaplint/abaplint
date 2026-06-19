import {seq, optPrio, altPrio, Expression, tok} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {ParenLeftW, WAt, WParenRightW} from "../../1_lexer/tokens";
import {SimpleSource3} from "./simple_source3";
import {Source} from "./source";
import {SQLFunctionInput} from "./sql_function_input";

export class SQLRegexprPattern extends Expression {
  public getRunnable(): IStatementRunnable {
    const hostParen = seq(tok(ParenLeftW), Source, tok(WParenRightW));
    const hostVar = seq(tok(WAt), altPrio(SimpleSource3, hostParen));
    const flag = seq("FLAG", altPrio(hostVar, SQLFunctionInput));
    return seq(SQLFunctionInput, optPrio(flag), "IN", SQLFunctionInput);
  }
}
