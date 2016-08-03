import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class Static extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(alt(str("STATIC"), str("STATICS")),
                  Reuse.field(),
                  alt(Reuse.type(), Reuse.type_table()));

    return ret;
  }

}