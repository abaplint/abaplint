import {alt, Expression, IStatementRunnable} from "../combi";
import {TargetFieldSymbol, InlineFS} from "./";

export class FSTarget extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(new InlineFS(), new TargetFieldSymbol());
  }
}