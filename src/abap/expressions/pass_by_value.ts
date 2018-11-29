import {seq, str, tok, Expression, IStatementRunnable} from "../combi";
import {ParenLeft, ParenRightW} from "../tokens/";
import {Field} from "./";

export class PassByValue extends Expression {
  public getRunnable(): IStatementRunnable {
    const value = seq(str("VALUE"),
                      tok(ParenLeft),
                      new Field(),
                      tok(ParenRightW));

    return value;
  }
}