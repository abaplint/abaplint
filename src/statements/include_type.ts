import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class IncludeType extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let tas = seq(str("AS"), new Reuse.Field());

    let renaming = seq(str("RENAMING WITH SUFFIX"), new Reuse.Source());

    let ret = seq(str("INCLUDE"),
                  alt(str("TYPE"), str("STRUCTURE")),
                  new Reuse.TypeName(),
                  opt(tas),
                  opt(renaming));

    return ret;
  }

}