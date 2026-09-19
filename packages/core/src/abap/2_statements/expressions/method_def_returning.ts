import {seq, altPrio, Expression, tok} from "../combi";
import * as Expressions from ".";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class MethodDefReturning extends Expression {
  public getRunnable(): IStatementRunnable {
    // see MethodParam: the lexer gives "!VALUE" as one Identifier
    const value = seq(altPrio("VALUE", "!VALUE"),
                      tok(ParenLeft),
                      Expressions.MethodParamName,
                      tok(ParenRightW));

    return seq("RETURNING", value, Expressions.TypeParam);
  }
}