import {seq, altPrio, Expression, tok} from "../combi";
import * as Expressions from ".";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class MethodParam extends Expression {
  public getRunnable(): IStatementRunnable {
    // The escape is part of the token: the lexer gives "!VALUE" as a single
    // Identifier, so a literal "VALUE" cannot match it and the whole METHODS
    // statement falls back to Unknown.
    const ref = seq(altPrio("REFERENCE", "!REFERENCE"),
                    tok(ParenLeft),
                    Expressions.MethodParamName,
                    tok(ParenRightW));

    const value = seq(altPrio("VALUE", "!VALUE"),
                      tok(ParenLeft),
                      Expressions.MethodParamName,
                      tok(ParenRightW));

    const fieldsOrValue = seq(altPrio(value, ref, Expressions.MethodParamName),
                              Expressions.TypeParam);

    return fieldsOrValue;
  }

}