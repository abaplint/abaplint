import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class Parameter extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let para = alt(str("PARAMETER"), str("PARAMETERS"));
    let def = seq(str("DEFAULT"), alt(Reuse.constant(), Reuse.field_chain()));
    let radio = seq(str("RADIOBUTTON GROUP"), Reuse.field());
    let type = seq(str("TYPE"), Reuse.typename());

    let ret = seq(para,
                  Reuse.field(),
                  opt(type),
                  opt(radio),
                  opt(def),
                  opt(str("OBLIGATORY")));

    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Parameter(tokens);
    }
    return undefined;
  }

}