import {regex as reg, Expression, IStatementRunnable} from "../combi";

export class MethodParamName extends Expression {
  public getRunnable(): IStatementRunnable {
    const field = reg(/^!?(\/\w+\/)?\w+$/);
    return field;
  }
}