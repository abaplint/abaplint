import {alt, Expression, IStatementRunnable} from "../combi";
import {FieldSymbol, InlineFS} from "./";

export class FSTarget extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(new InlineFS(), new FieldSymbol());
  }
}