import {altPrio, tok, Expression} from "../combi";
import {InstanceArrow, StaticArrow, Dash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class ArrowOrDash extends Expression {
  public getRunnable(): IStatementRunnable {
    return altPrio(tok(InstanceArrow), tok(StaticArrow), tok(Dash));
  }
}