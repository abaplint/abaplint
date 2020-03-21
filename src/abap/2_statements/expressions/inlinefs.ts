import {str, seq, tok, ver, Expression} from "../combi";
import {ParenRightW, ParenLeft} from "../../1_lexer/tokens";
import {TargetFieldSymbol} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class InlineFS extends Expression {
  public getRunnable(): IStatementRunnable {
    const right = tok(ParenRightW);
    const left = tok(ParenLeft);
    const fs = seq(str("FIELD-SYMBOL"), left, new TargetFieldSymbol(), right);

    return ver(Version.v740sp02, fs);
  }
}