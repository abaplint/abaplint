import {alt, Expression, IRunnable} from "../combi";
import {FieldChain, MethodCallChain} from "./";

export class FieldOrMethodCall extends Expression {
  public getRunnable(): IRunnable {
    return alt(new FieldChain(), new MethodCallChain());
  }
}