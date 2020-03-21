import {regex as reg, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class MethodParamName extends Expression {
  public getRunnable(): IStatementRunnable {
    const field = reg(/^!?(\/\w+\/)?\w+$/);
    return field;
  }
}