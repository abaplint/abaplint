import {seq, str, alt, tok, Expression, IRunnable} from "../combi";
import {ParenLeft, ParenRight, ParenRightW} from "../tokens/";
import {Field} from "./";

export class PassByReference extends Expression {
  public getRunnable(): IRunnable {
    let value = seq(str("REFERENCE"),
                    tok(ParenLeft),
                    new Field(),
                    alt(tok(ParenRight), tok(ParenRightW)));

    return value;
  }
}