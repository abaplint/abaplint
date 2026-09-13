import {seq, altPrio, optPrio, tok, Expression} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {PassByValue, FunctionModuleParamName, FormParamType} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FunctionModuleParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const reference = seq("REFERENCE",
                          tok(ParenLeft),
                          FunctionModuleParamName,
                          tok(ParenRightW));

    const name = altPrio(PassByValue, reference, FunctionModuleParamName);

    return seq(name, optPrio(FormParamType));
  }
}
