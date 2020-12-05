import {seqs, Expression, str, opt} from "../combi";
import {MethodParam} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodParamOptional extends Expression {
  public getRunnable(): IStatementRunnable {
    return seqs(MethodParam, opt(str("OPTIONAL")));
  }

}