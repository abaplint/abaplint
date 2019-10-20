import {seq, alt, tok, Expression, IStatementRunnable} from "../combi";
import {ParenLeft, ParenRightW} from "../tokens/";
import {Integer, SimpleFieldChain} from "./";

export class ConstantFieldLength extends Expression {
  public getRunnable(): IStatementRunnable {
    const length = seq(tok(ParenLeft),
                       alt(new Integer(), new SimpleFieldChain()),
                       tok(ParenRightW));

    return length;
  }
}