import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class SelectOption extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let def = seq(str("DEFAULT"), alt(Reuse.constant(), Reuse.field_chain()));

    let option = seq(str("OPTION"), Reuse.field());

    let ret = seq(str("SELECT-OPTIONS"),
                  Reuse.field(),
                  str("FOR"),
                  Reuse.field_sub(),
                  opt(def),
                  opt(option));

    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new SelectOption(tokens);
    }
    return undefined;
  }

}