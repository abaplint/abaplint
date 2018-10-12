import {regex as reg, Expression, IRunnable} from "../combi";

export class NamespaceSimpleName extends Expression {
  public get_runnable(): IRunnable {
    return reg(/^((\w*\/\w+\/)|(\w*\/\w+\/)?[\w$%]+)$/);
  }
}