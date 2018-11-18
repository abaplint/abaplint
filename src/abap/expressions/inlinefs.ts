import {alt, str, seq, tok, ver, Expression, IRunnable} from "../combi";
import {ParenRight, ParenRightW, ParenLeft} from "../tokens/";
import {FieldSymbol} from "./";
import {Version} from "../../version";

export class InlineFS extends Expression {
  public getRunnable(): IRunnable {
    const right = alt(tok(ParenRight), tok(ParenRightW));
    const left = tok(ParenLeft);
    const fs = seq(str("FIELD-SYMBOL"), left, new FieldSymbol(), right);

    return ver(Version.v740sp02, fs);
  }
}