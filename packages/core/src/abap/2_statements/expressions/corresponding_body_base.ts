import {seq, tok, Expression} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Source} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class CorrespondingBodyBase extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("BASE", tok(WParenLeftW), Source, tok(WParenRightW));
  }
}