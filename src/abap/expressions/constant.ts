import {alt, Expression, IStatementRunnable} from "../combi";
import {ConstantString, TextElementString, Integer} from "./";

export class Constant extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(new ConstantString(), new TextElementString(), new Integer());
  }
}