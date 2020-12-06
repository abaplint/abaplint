import {seqs, opts, Expression} from "../combi";
import {ParameterListT, ParameterListExceptions, Field} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ReceiveParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const importing = seqs("IMPORTING", ParameterListT);
    const tables = seqs("TABLES", ParameterListT);
    const changing = seqs("CHANGING", ParameterListT);
    const exceptions = seqs("EXCEPTIONS", opts(ParameterListExceptions), opts(Field));
    const long = seqs(opts(importing),
                      opts(changing),
                      opts(tables),
                      opts(exceptions));

    return long;
  }
}