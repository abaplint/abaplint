import {str, seq, tok, ver, Expression, IStatementRunnable} from "../combi";
import {ParenRightW, ParenLeft} from "../tokens/";
import {TargetFieldSymbol} from "./";
import {Version} from "../../version";

export class InlineFS extends Expression {
  public getRunnable(): IStatementRunnable {
    const right = tok(ParenRightW);
    const left = tok(ParenLeft);
    const fs = seq(str("FIELD-SYMBOL"), left, new TargetFieldSymbol(), right);

    return ver(Version.v740sp02, fs);
  }
}