import {alt, Expression} from "../combi";
import {Constant, TextElement, FieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {MethodCallChain} from "./method_call_chain";

export class SimpleSource4 extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(Constant, TextElement, FieldChain, MethodCallChain);
  }
}