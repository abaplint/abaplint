import {alt, Expression, IStatementRunnable} from "../combi";
import {Constant} from "./constant";
import {FieldChain, StringTemplate, MethodCallChain} from ".";

export class SimpleSource extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(new Constant(), new MethodCallChain(), new StringTemplate(), new FieldChain());
  }
}