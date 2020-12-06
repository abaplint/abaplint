import {seq, pluss, tok, alts, Expression} from "../combi";
import {ClassName} from ".";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class FormRaising extends Expression {
  public getRunnable(): IStatementRunnable {
    const resume = seq("RESUMABLE",
                       tok(ParenLeft),
                       ClassName,
                       tok(ParenRightW));

    const raising = seq("RAISING", pluss(alts(ClassName, resume)));

    return raising;
  }
}