import {seq, altPrio, Expression, tok} from "../combi";
import * as Expressions from ".";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class MethodParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const ref = seq("REFERENCE",
                    tok(ParenLeft),
                    Expressions.MethodParamName,
                    tok(ParenRightW));

    const value = seq("VALUE",
                      tok(ParenLeft),
                      Expressions.MethodParamName,
                      tok(ParenRightW));

    const fieldsOrValue = seq(altPrio(value, ref, Expressions.MethodParamName),
                              Expressions.TypeParam);

    return fieldsOrValue;
  }

}