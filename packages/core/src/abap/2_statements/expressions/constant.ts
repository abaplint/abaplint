import {altPrios, Expression} from "../combi";
import {ConstantString, TextElementString, Integer, ConcatenatedConstant} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Constant extends Expression {
  public getRunnable(): IStatementRunnable {
    return altPrios(TextElementString,
                    ConcatenatedConstant,
                    ConstantString,
                    Integer);
  }
}