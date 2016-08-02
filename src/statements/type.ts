import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let reg = Combi.regex;

export class Type extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let fieldName = reg(/^\w+$/);

    let def = seq(fieldName,
                  alt(Reuse.type(), Reuse.type_table()));

    let beginEnd = seq(alt(str("BEGIN OF"), str("END OF")), fieldName);

    let ret = seq(alt(str("TYPE"), str("TYPES")), alt(def, beginEnd));

    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Type(tokens);
    }
    return undefined;
  }

}