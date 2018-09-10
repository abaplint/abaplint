import {Statement} from "./statement";
import {str, seq, opt, alt, per, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class SelectOption extends Statement {

  public static get_matcher(): IRunnable {
    let sourc = alt(new Reuse.Constant(), new Reuse.FieldChain());

    let to = seq(str("TO"), sourc);

    let def = seq(str("DEFAULT"),
                  sourc,
                  opt(to));

    let option = seq(str("OPTION"), new Reuse.Field());

    let memory = seq(str("MEMORY ID"), new Reuse.Field());

    let match = seq(str("MATCHCODE OBJECT"), new Reuse.Field());

    let modif = seq(str("MODIF ID"), new Reuse.Modif());

    let visible = seq(str("VISIBLE LENGTH"), new Reuse.Source());

    let options = per(def,
                      option,
                      memory,
                      match,
                      visible,
                      modif,
                      str("LOWER CASE"),
                      str("NO-EXTENSION"),
                      str("NO INTERVALS"),
                      str("NO-DISPLAY"),
                      str("OBLIGATORY"));

    let ret = seq(str("SELECT-OPTIONS"),
                  new Reuse.Field(),
                  str("FOR"),
                  alt(new Reuse.FieldSub(), new Reuse.Dynamic()),
                  opt(options));

    return ret;
  }

}