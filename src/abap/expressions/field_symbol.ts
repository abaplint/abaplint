import {regex as reg, Expression, IStatementRunnable, altPrio, tok, seq} from "../combi";
import {Dash} from "../tokens";

export class FieldSymbol extends Expression {
  public getRunnable(): IStatementRunnable {
// todo, this only allows one dash in the name
    const dashes = seq(reg(/^<[\w\/%]+$/), tok(Dash), reg(/^[\w\/%]+>$/));

    return altPrio(reg(/^<[\w\/%]+>$/), dashes);
  }
}