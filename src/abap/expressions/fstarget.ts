import {alt, Expression, IRunnable} from "../combi";
import {FieldSymbol, InlineFS} from "./";

export class FSTarget extends Expression {
  public getRunnable(): IRunnable {
    return alt(new InlineFS(), new FieldSymbol());
  }
}