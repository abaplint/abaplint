import {regex as reg, Expression, IStatementRunnable} from "../combi";

export class Modif extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^\w{1,3}$/);
  }
}