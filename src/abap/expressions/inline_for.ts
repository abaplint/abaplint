import {alt, Expression, IStatementRunnable} from "../combi";
import {Field, FieldSymbol} from "./";

export class InlineFor extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(new Field(), new FieldSymbol());
  }
}