import {seq, alt, str, tok, Expression, IStatementRunnable} from "../combi";
import {ParenLeft, ParenRight, ParenRightW} from "../tokens/";
import {Field} from "./";

export class PassByValue extends Expression {
  public getRunnable(): IStatementRunnable {
    const value = seq(str("VALUE"),
                      tok(ParenLeft),
                      new Field(),
                      alt(tok(ParenRight), tok(ParenRightW)));

    return value;
  }
}