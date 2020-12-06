import {seq, alt, opt, tok, regex as reg, Expression, starPrios} from "../combi";
import {StaticArrow, Dash, InstanceArrow} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

// todo, can this be replaced with one of the FieldChain expressions?

export class TypeName extends Expression {

  public getRunnable(): IStatementRunnable {
    const name = reg(/^[\w~\/%$]+$/);
    const cla = seq(name, alt(tok(StaticArrow), tok(InstanceArrow)));
    const field = seq(tok(Dash), name);
    return seq(opt(cla), name, starPrios(field));
  }

}