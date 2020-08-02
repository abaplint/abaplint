import {seq, str, tok, Expression} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {FormParamName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class PassByValue extends Expression {
  public getRunnable(): IStatementRunnable {
    const value = seq(str("VALUE"),
                      tok(ParenLeft),
                      new FormParamName(),
                      tok(ParenRightW));

    return value;
  }
}