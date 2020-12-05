import {seqs, alt, opt, tok, regex as reg, Expression, starPrio} from "../combi";
import {StaticArrow, Dash, InstanceArrow} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

// todo, can this be replaced with one of the FieldChain expressions?

export class TypeName extends Expression {

  public getRunnable(): IStatementRunnable {
    const name = reg(/^[\w~\/%$]+$/);
    const cla = seqs(name, alt(tok(StaticArrow), tok(InstanceArrow)));
    const field = seqs(tok(Dash), name);
    return seqs(opt(cla), name, starPrio(field));
  }

}