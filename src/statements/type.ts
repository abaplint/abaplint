import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class Type extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let def = seq(new Reuse.TypeName(),
                  opt(new Reuse.FieldLength()),
                  alt(new Reuse.Type(), new Reuse.TypeTable()));

    let beginEnd = seq(alt(str("BEGIN OF"), str("END OF")), new Reuse.TypeName());

    let ret = seq(alt(str("TYPE"), str("TYPES")), alt(def, beginEnd));

    return ret;
  }

}