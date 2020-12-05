import {seqs, optPrio, Expression} from "../combi";
import {ParameterListS, ParameterListT, ParameterListExceptions, ParameterT} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const exporting = seqs("EXPORTING", ParameterListS);
    const importing = seqs("IMPORTING", ParameterListT);
    const changing = seqs("CHANGING", ParameterListT);
    const receiving = seqs("RECEIVING", ParameterT);
    const exceptions = seqs("EXCEPTIONS", ParameterListExceptions);
    const long = seqs(optPrio(exporting),
                      optPrio(importing),
                      optPrio(changing),
                      optPrio(receiving),
                      optPrio(exceptions));

    return long;
  }
}