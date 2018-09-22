import {seq, alt, str, tok, Reuse, IRunnable} from "../combi";
import {ParenLeft, ParenRight, ParenRightW} from "../tokens/";
import {Field} from "./";

export class PassByValue extends Reuse {
  public get_runnable(): IRunnable {
    let value = seq(str("VALUE"),
                    tok(ParenLeft),
                    new Field(),
                    alt(tok(ParenRight), tok(ParenRightW)));

    return value;
  }
}