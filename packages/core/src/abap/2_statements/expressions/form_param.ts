import {seq, altPrio, optPrio, Expression} from "../combi";
import {PassByValue, FormParamType, FormParamName, SimpleFieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FormParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const stru = seq("STRUCTURE", SimpleFieldChain);

    const ret = seq(altPrio(PassByValue, FormParamName),
                    optPrio(altPrio(FormParamType, stru)));

    return ret;
  }
}