import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, regex as reg, alt, star, IRunnable} from "../combi";

export class FieldSymbol extends Statement {

  public static get_matcher(): IRunnable {
// todo, reuse type definition from DATA
    return seq(alt(str("FIELD-SYMBOL"), str("FIELD-SYMBOLS")),
               new Reuse.FieldSymbol(),
               star(reg(/^.*$/)));
  }

}