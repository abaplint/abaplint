import {seq, tok, Expression} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {FormParamName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class PassByValue extends Expression {
  public getRunnable(): IStatementRunnable {
    const value = seq("VALUE",
                      tok(ParenLeft),
                      FormParamName,
                      tok(ParenRightW));

    return value;
  }
}