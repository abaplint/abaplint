import {seq, alt, tok, Expression} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Integer, SimpleFieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ConstantFieldLength extends Expression {
  public getRunnable(): IStatementRunnable {
    const length = seq(tok(ParenLeft),
                       alt(new Integer(), new SimpleFieldChain()),
                       tok(ParenRightW));

    return length;
  }
}