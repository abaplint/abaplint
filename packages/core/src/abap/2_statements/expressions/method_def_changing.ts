import {seq, pluss, Expression} from "../combi";
import {MethodParamOptional} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodDefChanging extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("CHANGING", pluss(MethodParamOptional));
  }
}