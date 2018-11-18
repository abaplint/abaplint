import {str, seq, opt, regex as reg, plus, IRunnable, Expression} from "../combi";
import {MethodParam} from ".";

export class MethodDefImporting extends Expression  {
  public getRunnable(): IRunnable {
    const field = reg(/^!?(\/\w+\/)?\w+$/);

    return seq(str("IMPORTING"),
               plus(seq(new MethodParam(), opt(str("OPTIONAL")))),
               opt(seq(str("PREFERRED PARAMETER"), field)));
  }
}