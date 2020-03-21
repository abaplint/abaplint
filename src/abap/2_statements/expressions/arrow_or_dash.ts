import {altPrio, tok, Expression, IStatementRunnable} from "../combi";
import {InstanceArrow, StaticArrow, Dash} from "../../1_lexer/tokens";

export class ArrowOrDash extends Expression {
  public getRunnable(): IStatementRunnable {
    return altPrio(tok(InstanceArrow), tok(StaticArrow), tok(Dash));
  }
}