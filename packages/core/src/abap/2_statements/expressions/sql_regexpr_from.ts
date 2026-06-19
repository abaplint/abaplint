import {seq, altPrio, Expression, tok} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {ParenLeftW, WAt, WParenRightW} from "../../1_lexer/tokens";
import {Integer} from "./integer";
import {SimpleSource3} from "./simple_source3";
import {Source} from "./source";

export class SQLRegexprFrom extends Expression {
  public getRunnable(): IStatementRunnable {
    const hostParen = seq(tok(ParenLeftW), Source, tok(WParenRightW));
    const hostVar = seq(tok(WAt), altPrio(SimpleSource3, hostParen));
    return seq("FROM", altPrio(hostVar, Integer));
  }
}
