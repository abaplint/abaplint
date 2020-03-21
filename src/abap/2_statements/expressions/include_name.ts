import {seq, opt, tok, regex as reg, Expression, IStatementRunnable} from "../combi";
import {Dash} from "../../1_lexer/tokens";

export class IncludeName extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(reg(/^<?(\/\w+\/)?[\w%]+(~\w+)?>?$/), opt(seq(tok(Dash), reg(/^\w+$/))));
  }
}