import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class IncludeType extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("INCLUDE"),
                  alt(str("TYPE"), str("STRUCTURE")),
                  new Reuse.TypeName(),
                  opt(seq(str("AS"), new Reuse.Field())));

    return ret;
  }

}