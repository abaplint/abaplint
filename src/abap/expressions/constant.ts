import {alt, Expression, IStatementRunnable} from "../combi";
import {ConstantString, Integer} from "./";

export class Constant extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(new ConstantString(), new Integer());
  }
}