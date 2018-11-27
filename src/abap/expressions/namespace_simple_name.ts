import {regex as reg, Expression, IStatementRunnable} from "../combi";

export class NamespaceSimpleName extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^((\w*\/\w+\/)|(\w*\/\w+\/)?[\w\*$%]+)$/);
  }
}