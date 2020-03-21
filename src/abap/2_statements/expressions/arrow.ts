import {alt, tok, Expression, IStatementRunnable} from "../combi";
import {InstanceArrow, StaticArrow} from "../../1_lexer/tokens";

export class Arrow extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(tok(InstanceArrow), tok(StaticArrow));
  }
}