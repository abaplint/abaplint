import {seqs, optPrio, tok, str, Expression, altPrio} from "../combi";
import {WParenLeftW, WParenRightW, WParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Cond} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class CondSub extends Expression {
  public getRunnable(): IStatementRunnable {
    // rule ParserMissingSpace makes sure the whitespace is correct
    const another = seqs(optPrio(str("NOT")),
                         altPrio(tok(WParenLeftW), tok(WParenLeft)),
                         Cond,
                         altPrio(tok(WParenRightW), tok(ParenRightW)));

    return another;
  }
}