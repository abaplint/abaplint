import {seq, Expression, pluss, alts, tok} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {ClassName} from "./class_name";

export class MethodDefRaising extends Expression {
  public getRunnable(): IStatementRunnable {
    const resumable = seq("RESUMABLE",
                          tok(ParenLeft),
                          ClassName,
                          tok(ParenRightW));

    const raising = seq("RAISING", pluss(alts(resumable, ClassName)));

    return raising;
  }
}