import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let per = Combi.per;

export class Parameter extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let para = alt(str("PARAMETER"), str("PARAMETERS"));
    let def = seq(str("DEFAULT"), alt(new Reuse.Constant(), new Reuse.FieldChain()));
    let radio = seq(str("RADIOBUTTON GROUP"), new Reuse.Field());
    let type = seq(alt(str("TYPE"), str("LIKE")), new Reuse.FieldChain());
    let memory = seq(str("MEMORY ID"), new Reuse.Field());
    let listbox = seq(str("AS LISTBOX VISIBLE LENGTH"), new Reuse.Constant());
    let cmd = seq(str("USER-COMMAND"), new Reuse.Field());
    let modif = seq(str("MODIF ID"), new Reuse.Field());
    let visible = seq(str("VISIBLE LENGTH"), new Reuse.Constant());
    let match = seq(str("MATCHCODE OBJECT"), new Reuse.Field());

    let perm = per(def,
                   str("OBLIGATORY"),
                   match,
                   cmd,
                   radio,
                   memory,
                   modif,
                   listbox,
                   visible,
                   str("LOWER CASE"));

    let ret = seq(para,
                  new Reuse.Field(),
                  opt(type),
                  opt(str("NO-DISPLAY")),
                  opt(str("AS CHECKBOX")),
                  opt(perm));

    return ret;
  }

}