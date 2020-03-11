import {str, seq, opt, regex as reg, plus, IStatementRunnable, Expression} from "../combi";
import {MethodParamOptional} from ".";

export class MethodDefImporting extends Expression  {
  public getRunnable(): IStatementRunnable {
    const field = reg(/^!?(\/\w+\/)?\w+$/);

    return seq(str("IMPORTING"),
               plus(new MethodParamOptional()),
               opt(seq(str("PREFERRED PARAMETER"), field)));
  }
}