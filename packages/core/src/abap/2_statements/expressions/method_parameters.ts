import {seq, optPrios, Expression} from "../combi";
import {ParameterListS, ParameterListT, ParameterListExceptions, ParameterT} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const exporting = seq("EXPORTING", ParameterListS);
    const importing = seq("IMPORTING", ParameterListT);
    const changing = seq("CHANGING", ParameterListT);
    const receiving = seq("RECEIVING", ParameterT);
    const exceptions = seq("EXCEPTIONS", ParameterListExceptions);
    const long = seq(optPrios(exporting),
                     optPrios(importing),
                     optPrios(changing),
                     optPrios(receiving),
                     optPrios(exceptions));

    return long;
  }
}