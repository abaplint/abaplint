import {str, seq, opt, regex as reg, plus, IStatementRunnable, Expression} from "../combi";
import {MethodParam} from ".";

export class MethodDefImporting extends Expression  {
  public getRunnable(): IStatementRunnable {
    const field = reg(/^!?(\/\w+\/)?\w+$/);

    return seq(str("IMPORTING"),
               plus(seq(new MethodParam(), opt(str("OPTIONAL")))),
               opt(seq(str("PREFERRED PARAMETER"), field)));
  }
}