import {seqs, opts, regex as reg, pluss, Expression} from "../combi";
import {MethodParamOptional} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodDefImporting extends Expression {
  public getRunnable(): IStatementRunnable {
    const field = reg(/^!?(\/\w+\/)?\w+$/);

    return seqs("IMPORTING",
                pluss(MethodParamOptional),
                opts(seqs("PREFERRED PARAMETER", field)));
  }
}