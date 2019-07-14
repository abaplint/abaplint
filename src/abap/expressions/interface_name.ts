import {regex as reg, Expression, IStatementRunnable} from "../combi";

export class InterfaceName extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^\w*(\/\w{3,}\/)?\w+$/);
  }
}