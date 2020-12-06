import {seqs, alts, opts, tok, regex as reg, Expression, starPrio} from "../combi";
import {StaticArrow, Dash, InstanceArrow} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

// todo, can this be replaced with one of the FieldChain expressions?

export class TypeName extends Expression {

  public getRunnable(): IStatementRunnable {
    const name = reg(/^[\w~\/%$]+$/);
    const cla = seqs(name, alts(tok(StaticArrow), tok(InstanceArrow)));
    const field = seqs(tok(Dash), name);
    return seqs(opts(cla), name, starPrio(field));
  }

}