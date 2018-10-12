import {regex as reg, Expression, IRunnable} from "../combi";

export class RadioGroupName extends Expression {
  public get_runnable(): IRunnable {
    return reg(/^[\w\d%]+$/);
  }
}