import {seq, Expression, plus, altPrio, tok, stopBefore1} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {ClassName} from "./class_name";

export class MethodDefRaising extends Expression {
  public getRunnable(): IStatementRunnable {
    const resumable = seq("RESUMABLE",
                          tok(ParenLeft),
                          ClassName,
                          tok(ParenRightW));

    // parameter section keywords cannot be exception names
    const name = seq(stopBefore1("IMPORTING", "EXPORTING", "CHANGING", "RETURNING", "RAISING", "EXCEPTIONS"), ClassName);

    const raising = seq("RAISING", plus(altPrio(resumable, name)));

    return raising;
  }
}
