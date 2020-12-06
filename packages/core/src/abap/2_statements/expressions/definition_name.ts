import {regex as reg, Expression, seq, tok, starPrios, optPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dash, DashW} from "../../1_lexer/tokens";

export class DefinitionName extends Expression {
  public getRunnable(): IStatementRunnable {
    const r = reg(/^((\w*\/\w+\/)|(\w*\/\w+\/)?[\w\*$%]+)$/);

    return seq(r, starPrios(seq(tok(Dash), optPrio(r))), optPrio(tok(DashW)));
  }
}