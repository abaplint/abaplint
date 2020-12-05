import {seqs, plus, Expression} from "../combi";
import {MethodParamOptional} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodDefChanging extends Expression {
  public getRunnable(): IStatementRunnable {
    return seqs("CHANGING", plus(new MethodParamOptional()));
  }
}