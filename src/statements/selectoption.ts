import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let per = Combi.per;

export class SelectOption extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let def = seq(str("DEFAULT"), alt(new Reuse.Constant(), new Reuse.FieldChain()));

    let option = seq(str("OPTION"), new Reuse.Field());

    let memory = seq(str("MEMORY ID"), new Reuse.Field());

    let match = seq(str("MATCHCODE OBJECT"), new Reuse.Field());

    let modif = seq(str("MODIF ID"), new Reuse.Field());

    let visible = seq(str("VISIBLE LENGTH"), new Reuse.Source());

    let options = per(def,
                      option,
                      memory,
                      match,
                      visible,
                      modif,
                      str("NO-EXTENSION"),
                      str("NO INTERVALS"),
                      str("OBLIGATORY"));

    let ret = seq(str("SELECT-OPTIONS"),
                  new Reuse.Field(),
                  str("FOR"),
                  alt(new Reuse.FieldSub(), new Reuse.Dynamic()),
                  opt(options));

    return ret;
  }

}