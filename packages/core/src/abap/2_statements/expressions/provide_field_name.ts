import {Dash} from "../../1_lexer/tokens";
import {regex as reg, Expression, optPrio, tok, seq} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class ProvideFieldName extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(reg(/^(?!(?:FROM|BETWEEN|WHERE)$)(\/\w+\/)?(\w+~(\w+|\*)|\w+)$/i), optPrio(seq(tok(Dash), reg(/^\w+$/i))));
  }
}