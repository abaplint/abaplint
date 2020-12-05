import {seqs, opt, Expression} from "../combi";
import {ParameterListT, ParameterListExceptions, Field} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ReceiveParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const importing = seqs("IMPORTING", ParameterListT);
    const tables = seqs("TABLES", ParameterListT);
    const changing = seqs("CHANGING", ParameterListT);
    const exceptions = seqs("EXCEPTIONS", opt(new ParameterListExceptions()), opt(new Field()));
    const long = seqs(opt(importing),
                      opt(changing),
                      opt(tables),
                      opt(exceptions));

    return long;
  }
}