import {alt, str, seq, star, Expression, IStatementRunnable} from "../combi";
import {Constant} from "./constant";
import {FieldChain, StringTemplate, MethodCallChain} from ".";

export class SimpleSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const concat = seq(str("&&"), new StringTemplate());

    const template = seq(new StringTemplate(), star(concat));

    return alt(new Constant(), new MethodCallChain(), template, new FieldChain());
  }
}