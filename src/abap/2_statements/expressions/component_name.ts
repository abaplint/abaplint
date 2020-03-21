import {regex as reg, Expression, IStatementRunnable} from "../combi";

export class ComponentName extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^(\/\w+\/)?[\w\d_\*\~]+$/);
  }
}