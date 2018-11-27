import {regex as reg, Expression, IStatementRunnable} from "../combi";

export class RadioGroupName extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^[\w\d%]+$/);
  }
}