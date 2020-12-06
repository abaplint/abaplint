import {regex as reg, Expression, seqs, tok, starPrios, optPrios} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dash, DashW} from "../../1_lexer/tokens";

export class DefinitionName extends Expression {
  public getRunnable(): IStatementRunnable {
    const r = reg(/^((\w*\/\w+\/)|(\w*\/\w+\/)?[\w\*$%]+)$/);

    return seqs(r, starPrios(seqs(tok(Dash), optPrios(r))), optPrios(tok(DashW)));
  }
}