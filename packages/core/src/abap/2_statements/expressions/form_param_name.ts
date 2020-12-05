import {regex as reg, seqs, tok, Expression, starPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dash} from "../../1_lexer/tokens";

export class FormParamName extends Expression {
  public getRunnable(): IStatementRunnable {
    const r = reg(/^[\w$&\*%\/]+$/);

    // dashes in form parameter names allowed, intention is not to support this
    // but avoid the structural errors
    return seqs(r, starPrio(seqs(tok(Dash), r)));
  }
}