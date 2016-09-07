import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class Type extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let def = seq(Reuse.type_name(),
                  opt(Reuse.field_length()),
                  alt(Reuse.type(), Reuse.type_table()));

    let beginEnd = seq(alt(str("BEGIN OF"), str("END OF")), Reuse.type_name());

    let ret = seq(alt(str("TYPE"), str("TYPES")), alt(def, beginEnd));

    return ret;
  }

}