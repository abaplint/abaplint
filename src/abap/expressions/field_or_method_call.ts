import {alt, Expression, IStatementRunnable} from "../combi";
import {FieldChain, MethodCallChain} from "./";

export class FieldOrMethodCall extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(new FieldChain(), new MethodCallChain());
  }
}