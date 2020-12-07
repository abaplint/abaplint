import {altPrio, Expression} from "../combi";
import {ConstantString, TextElementString, Integer, ConcatenatedConstant} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Constant extends Expression {
  public getRunnable(): IStatementRunnable {
    return altPrio(TextElementString,
                   ConcatenatedConstant,
                   ConstantString,
                   Integer);
  }
}