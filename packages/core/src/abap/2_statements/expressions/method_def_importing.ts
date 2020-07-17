import {str, seq, opt, regex as reg, plus, Expression} from "../combi";
import {MethodParamOptional} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodDefImporting extends Expression {
  public getRunnable(): IStatementRunnable {
    const field = reg(/^!?(\/\w+\/)?\w+$/);

    return seq(str("IMPORTING"),
               plus(new MethodParamOptional()),
               opt(seq(str("PREFERRED PARAMETER"), field)));
  }
}