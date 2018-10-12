import {plus, Expression, IRunnable} from "../combi";
import {ParameterException} from "./";

export class ParameterListExceptions extends Expression {
  public getRunnable(): IRunnable {
    return plus(new ParameterException());
  }
}