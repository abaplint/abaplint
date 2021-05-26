import {seq, altPrio, optPrio, Expression} from "../combi";
import {PassByValue, FormParamType, FormParamName, NamespaceSimpleName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FormParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const stru = seq("STRUCTURE", NamespaceSimpleName);

    const ret = seq(altPrio(PassByValue, FormParamName),
                    optPrio(altPrio(FormParamType, stru)));

    return ret;
  }
}