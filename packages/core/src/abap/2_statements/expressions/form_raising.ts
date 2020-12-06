import {seq, plus, tok, alt, Expression} from "../combi";
import {ClassName} from ".";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class FormRaising extends Expression {
  public getRunnable(): IStatementRunnable {
    const resume = seq("RESUMABLE",
                       tok(ParenLeft),
                       ClassName,
                       tok(ParenRightW));

    const raising = seq("RAISING", plus(alt(ClassName, resume)));

    return raising;
  }
}