import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class Assign extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let component = seq(str("COMPONENT"), Reuse.source(), str("OF STRUCTURE"), Reuse.source());
    let source = alt(Reuse.source(), component, Reuse.dynamic());

    let ret = seq(str("ASSIGN"), source, str("TO"), Reuse.field_symbol(), opt(str("CASTING")));

    return ret;
  }

}