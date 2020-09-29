import {seq, Expression, plus, alt, str, tok} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {ClassName} from "./class_name";

export class MethodDefRaising extends Expression {
  public getRunnable(): IStatementRunnable {
    const resumable = seq(str("RESUMABLE"),
                          tok(ParenLeft),
                          new ClassName(),
                          tok(ParenRightW));

    const raising = seq(str("RAISING"), plus(alt(resumable, new ClassName())));

    return raising;
  }
}