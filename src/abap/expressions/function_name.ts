import {alt, Expression, IRunnable} from "../combi";
import {Constant, FieldChain} from "./";

export class FunctionName extends Expression {
  public getRunnable(): IRunnable {
    return alt(new Constant(), new FieldChain());
  }
}