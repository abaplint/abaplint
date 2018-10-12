import {alt, Expression, IRunnable} from "../combi";
import {FieldSymbol, InlineFS} from "./";

export class FSTarget extends Expression {
  public get_runnable(): IRunnable {
    return alt(new InlineFS(), new FieldSymbol());
  }
}