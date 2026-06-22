import {seq, tok, ver, Expression, AlsoIn} from "../combi";
import {ParenRightW, ParenLeft} from "../../1_lexer/tokens";
import {TargetFieldSymbol} from ".";
import {Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class InlineFS extends Expression {
  public getRunnable(): IStatementRunnable {
    const right = tok(ParenRightW);
    const left = tok(ParenLeft);
    const fs = seq("FIELD-SYMBOL", left, TargetFieldSymbol, right);

    return ver(Release.v740sp02, fs, {also: AlsoIn.OpenABAP});
  }
}