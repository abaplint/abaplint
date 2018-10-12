import {regex as reg, Expression, IRunnable} from "../combi";

export class NamespaceSimpleName extends Expression {
  public getRunnable(): IRunnable {
    return reg(/^((\w*\/\w+\/)|(\w*\/\w+\/)?[\w$%]+)$/);
  }
}