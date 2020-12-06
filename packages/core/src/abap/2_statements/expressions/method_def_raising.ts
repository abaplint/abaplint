import {seqs, Expression, plus, alts, tok} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {ClassName} from "./class_name";

export class MethodDefRaising extends Expression {
  public getRunnable(): IStatementRunnable {
    const resumable = seqs("RESUMABLE",
                           tok(ParenLeft),
                           ClassName,
                           tok(ParenRightW));

    const raising = seqs("RAISING", plus(alts(resumable, ClassName)));

    return raising;
  }
}