import {str, seq, tok, ver, Expression, IStatementRunnable} from "../combi";
import {ParenRightW, ParenLeft} from "../tokens/";
import {FieldSymbol} from "./";
import {Version} from "../../version";

export class InlineFS extends Expression {
  public getRunnable(): IStatementRunnable {
    const right = tok(ParenRightW);
    const left = tok(ParenLeft);
    const fs = seq(str("FIELD-SYMBOL"), left, new FieldSymbol(), right);

    return ver(Version.v740sp02, fs);
  }
}