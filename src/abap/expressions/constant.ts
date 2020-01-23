import {altPrio, Expression, IStatementRunnable} from "../combi";
import {ConstantString, TextElementString, Integer, ConcatenatedConstant} from "./";

export class Constant extends Expression {
  public getRunnable(): IStatementRunnable {
    return altPrio(new TextElementString(),
                   new ConcatenatedConstant(),
                   new ConstantString(),
                   new Integer());
  }
}