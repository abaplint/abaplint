import {alt, str, seq, tok, ver, Reuse, IRunnable} from "../combi";
import {ParenRight, ParenRightW, ParenLeft} from "../tokens/";
import {FieldSymbol} from "./";
import {Version} from "../../version";

export class InlineFS extends Reuse {
  public get_runnable(): IRunnable {
    let right = alt(tok(ParenRight), tok(ParenRightW));
    let left = tok(ParenLeft);
    let fs = seq(str("FIELD-SYMBOL"), left, new FieldSymbol(), right);

    return ver(Version.v740sp02, fs);
  }
}