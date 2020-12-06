import {seqs, opts, alts, Expression} from "../combi";
import {ParameterListS, ParameterListT, ParameterListExceptions, Field} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FunctionParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const exporting = seqs("EXPORTING", ParameterListS);
    const importing = seqs("IMPORTING", ParameterListT);
    const changing = seqs("CHANGING", ParameterListT);
    const tables = seqs("TABLES", ParameterListT);
    const exceptions = seqs("EXCEPTIONS", opts(alts(ParameterListExceptions, Field)));
    const long = seqs(opts(exporting),
                      opts(importing),
                      opts(tables),
                      opts(changing),
                      opts(exceptions));

    return long;
  }
}