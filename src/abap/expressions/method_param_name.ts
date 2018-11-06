import {regex as reg, Expression, IRunnable} from "../combi";

export class MethodParamName extends Expression {
  public getRunnable(): IRunnable {
    let field = reg(/^!?(\/\w+\/)?\w+$/);
    return field;
  }
}