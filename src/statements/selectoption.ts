import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let per = Combi.per;

export class SelectOption extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let def = seq(str("DEFAULT"), alt(Reuse.constant(), Reuse.field_chain()));

    let option = seq(str("OPTION"), Reuse.field());

    let memory = seq(str("MEMORY ID"), Reuse.field());

    let match = seq(str("MATCHCODE OBJECT"), Reuse.field());

    let options = per(def,
                      option,
                      memory,
                      match,
                      str("NO-EXTENSION"),
                      str("NO INTERVALS"),
                      str("OBLIGATORY"));

    let ret = seq(str("SELECT-OPTIONS"),
                  Reuse.field(),
                  str("FOR"),
                  Reuse.field_sub(),
                  opt(options));

    return ret;
  }

}