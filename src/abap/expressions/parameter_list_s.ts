import {plus, Expression, IRunnable} from "../combi";
import {ParameterS} from "./";

export class ParameterListS extends Expression {
  public get_runnable(): IRunnable {
    return plus(new ParameterS());
  }
}