import {seqs, alt, Expression, tok} from "../combi";
import * as Expressions from ".";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class MethodParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const ref = seqs("REFERENCE",
                     tok(ParenLeft),
                     Expressions.MethodParamName,
                     tok(ParenRightW));

    const value = seqs("VALUE",
                       tok(ParenLeft),
                       Expressions.MethodParamName,
                       tok(ParenRightW));

    const fieldsOrValue = seqs(alt(value,
                                   ref,
                                   new Expressions.MethodParamName()),
                               Expressions.TypeParam);

    return fieldsOrValue;
  }

}