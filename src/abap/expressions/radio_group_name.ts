import {regex as reg, Expression, IRunnable} from "../combi";

export class RadioGroupName extends Expression {
  public getRunnable(): IRunnable {
    return reg(/^[\w\d%]+$/);
  }
}