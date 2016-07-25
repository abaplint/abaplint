import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let reg = Combi.regex;
let alt = Combi.alt;
let star = Combi.star;

export class FieldSymbol extends Statement {

  public static get_matcher(): Combi.IRunnable {
// todo, reuse type definition from DATA
    return seq(alt(str("FIELD-SYMBOL"), str("FIELD-SYMBOLS")), Reuse.field_symbol(), star(reg(/.*/)));
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new FieldSymbol(tokens);
    }
    return undefined;
  }

}