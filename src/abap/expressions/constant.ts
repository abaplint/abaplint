import {alt, Expression, IRunnable} from "../combi";
import {ConstantString, Integer} from "./";

export class Constant extends Expression {
  public getRunnable(): IRunnable {
    return alt(new ConstantString(), new Integer());
  }
}