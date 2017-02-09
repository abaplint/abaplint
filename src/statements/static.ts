import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class Static extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let type = seq(opt(new Reuse.FieldLength()), new Reuse.Type());

    let ret = seq(alt(str("STATIC"), str("STATICS")),
                  new Reuse.NamespaceSimpleName(),
                  opt(alt(type, new Reuse.TypeTable())),
                  opt(new Reuse.Value()));

    return ret;
  }

}