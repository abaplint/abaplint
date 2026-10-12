import {seq, Expression, opt} from "../combi";
import {MethodParam} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodParamOptional extends Expression {
  public getRunnable(): IStatementRunnable {
    // not optPrio, a parameter named "optional" can follow one with a DEFAULT value:
    // "a TYPE i DEFAULT 5 optional TYPE i"
    return seq(MethodParam, opt("OPTIONAL"));
  }

}