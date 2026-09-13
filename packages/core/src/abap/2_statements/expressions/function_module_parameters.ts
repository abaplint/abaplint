import {seq, altPrio, optPrio, plus, Expression} from "../combi";
import {FunctionModuleParamOptional, FunctionModuleParamTables, MethodDefRaising, MethodDefExceptions} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FunctionModuleParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const importing = seq("IMPORTING", plus(FunctionModuleParamOptional));
    const exporting = seq("EXPORTING", plus(FunctionModuleParamOptional));
    const changing = seq("CHANGING", plus(FunctionModuleParamOptional));
    const tables = seq("TABLES", plus(FunctionModuleParamTables));

    return seq(optPrio(importing),
               optPrio(exporting),
               optPrio(changing),
               optPrio(tables),
               optPrio(altPrio(MethodDefRaising, MethodDefExceptions)));
  }
}
