import {regex as reg, Expression, IRunnable} from "../combi";

export class MethodParamName extends Expression {
  public getRunnable(): IRunnable {
    const field = reg(/^!?(\/\w+\/)?\w+$/);
    return field;
  }
}