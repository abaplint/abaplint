import {plus, Expression, IStatementRunnable} from "../combi";
import {ParameterS} from "./";

export class ParameterListS extends Expression {
  public getRunnable(): IStatementRunnable {
    return plus(new ParameterS());
  }
}