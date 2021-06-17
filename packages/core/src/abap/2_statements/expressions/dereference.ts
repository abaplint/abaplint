import {InstanceArrow} from "../../1_lexer/tokens";
import {seq, tok, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class Dereference extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(tok(InstanceArrow), "*");
  }
}