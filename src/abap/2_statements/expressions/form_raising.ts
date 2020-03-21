import {seq, str, plus, tok, alt, Expression} from "../combi";
import {ClassName} from ".";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class FormRaising extends Expression {
  public getRunnable(): IStatementRunnable {
    const resume = seq(str("RESUMABLE"),
                       tok(ParenLeft),
                       new ClassName(),
                       tok(ParenRightW));

    const raising = seq(str("RAISING"), plus(alt(new ClassName(), resume)));

    return raising;
  }
}