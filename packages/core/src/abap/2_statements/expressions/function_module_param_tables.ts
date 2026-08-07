import {seq, altPrio, optPrio, Expression} from "../combi";
import {FunctionModuleParamName, FormParamType, SimpleFieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FunctionModuleParamTables extends Expression {
  public getRunnable(): IStatementRunnable {
    const structure = seq("STRUCTURE", SimpleFieldChain);

    return seq(FunctionModuleParamName, optPrio(altPrio(FormParamType, structure)), optPrio("OPTIONAL"));
  }

}
