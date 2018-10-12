import {alt, Expression, IRunnable} from "../combi";
import {FieldChain, MethodCallChain} from "./";

export class FieldOrMethodCall extends Expression {
  public get_runnable(): IRunnable {
    return alt(new FieldChain(), new MethodCallChain());
  }
}