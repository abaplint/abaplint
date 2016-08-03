import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let per = Combi.per;

export class Parameter extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let para = alt(str("PARAMETER"), str("PARAMETERS"));
    let def = seq(str("DEFAULT"), alt(Reuse.constant(), Reuse.field_chain()));
    let radio = seq(str("RADIOBUTTON GROUP"), Reuse.field());
    let type = seq(str("TYPE"), Reuse.typename());
    let memory = seq(str("MEMORY ID"), Reuse.field());
    let listbox = seq(str("AS LISTBOX VISIBLE LENGTH"), Reuse.constant());
    let cmd = seq(str("USER-COMMAND"), Reuse.field());
    let modif = seq(str("MODIF ID"), Reuse.field());

    let perm = per(def, str("OBLIGATORY"));

    let ret = seq(para,
                  Reuse.field(),
                  opt(type),
                  opt(listbox),
                  opt(str("LOWER CASE")),
                  opt(str("NO-DISPLAY")),
                  opt(modif),
                  opt(str("AS CHECKBOX")),
                  opt(memory),
                  opt(radio),
                  opt(cmd),
                  opt(perm));

    return ret;
  }

}