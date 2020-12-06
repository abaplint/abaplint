import {seqs, altPrios, optPrios, Expression} from "../combi";
import {PassByValue, FormParamType, FormParamName, NamespaceSimpleName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FormParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const stru = seqs(FormParamName, "STRUCTURE", NamespaceSimpleName);
    const val = seqs(PassByValue, optPrios(FormParamType));
    const field = seqs(FormParamName, optPrios(FormParamType));

    const ret = altPrios(stru, val, field);

    return ret;
  }
}