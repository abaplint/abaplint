import {regex as reg, Expression, seqs, tok, starPrio, optPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dash, DashW} from "../../1_lexer/tokens";

export class DefinitionName extends Expression {
  public getRunnable(): IStatementRunnable {
    const r = reg(/^((\w*\/\w+\/)|(\w*\/\w+\/)?[\w\*$%]+)$/);

    return seqs(r, starPrio(seqs(tok(Dash), optPrio(r))), optPrio(tok(DashW)));
  }
}