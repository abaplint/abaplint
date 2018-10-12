import {plus, Expression, IRunnable} from "../combi";
import {ParameterS} from "./";

export class ParameterListS extends Expression {
  public getRunnable(): IRunnable {
    return plus(new ParameterS());
  }
}