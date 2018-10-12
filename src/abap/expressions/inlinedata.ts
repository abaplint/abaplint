import {alt, str, seq, tok, ver, Expression, IRunnable} from "../combi";
import {ParenRight, ParenRightW, ParenLeft} from "../tokens/";
import {Field} from "./";
import {Version} from "../../version";

export class InlineData extends Expression {
  public getRunnable(): IRunnable {
    let right = alt(tok(ParenRight), tok(ParenRightW));
    let left = tok(ParenLeft);
    let data = seq(str("DATA"), left, new Field(), right);

    return ver(Version.v740sp02, data);
  }
}