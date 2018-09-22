import {Statement} from "./statement";
import {verNot, str, seq, opt, alt, per, IRunnable} from "../combi";
import {Source, FieldChain, Constant, Field, Modif, FieldSub, Dynamic} from "../expressions";
import {Version} from "../../version";

export class SelectOption extends Statement {

  public static get_matcher(): IRunnable {
    let sourc = alt(new Constant(), new FieldChain());

    let to = seq(str("TO"), sourc);

    let def = seq(str("DEFAULT"),
                  sourc,
                  opt(to));

    let option = seq(str("OPTION"), new Field());

    let memory = seq(str("MEMORY ID"), new Field());

    let match = seq(str("MATCHCODE OBJECT"), new Field());

    let modif = seq(str("MODIF ID"), new Modif());

    let visible = seq(str("VISIBLE LENGTH"), new Source());

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
                  new Field(),
                  str("FOR"),
                  alt(new FieldSub(), new Dynamic()),
                  opt(options));

    return verNot(Version.Cloud, ret);
  }

}