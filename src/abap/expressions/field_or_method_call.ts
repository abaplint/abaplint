import {alt, Reuse, IRunnable} from "../combi";
import {FieldChain, MethodCallChain} from "./";

export class FieldOrMethodCall extends Reuse {
  public get_runnable(): IRunnable {
    return alt(new FieldChain(), new MethodCallChain());
  }
}