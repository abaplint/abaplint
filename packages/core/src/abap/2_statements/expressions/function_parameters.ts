import {seqs, opt, alts, Expression} from "../combi";
import {ParameterListS, ParameterListT, ParameterListExceptions, Field} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FunctionParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const exporting = seqs("EXPORTING", ParameterListS);
    const importing = seqs("IMPORTING", ParameterListT);
    const changing = seqs("CHANGING", ParameterListT);
    const tables = seqs("TABLES", ParameterListT);
    const exceptions = seqs("EXCEPTIONS", opt(alts(ParameterListExceptions, Field)));
    const long = seqs(opt(exporting),
                      opt(importing),
                      opt(tables),
                      opt(changing),
                      opt(exceptions));

    return long;
  }
}