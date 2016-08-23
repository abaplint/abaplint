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

    let source = alt(seq(Reuse.source(), opt(seq(Reuse.arrow(), Reuse.dynamic()))),
                     component,
                     seq(Reuse.dynamic(), opt(seq(Reuse.arrow(), Reuse.field()))));

    let type = seq(str("TYPE"), Reuse.dynamic());

    let handle = seq(str("TYPE HANDLE"), Reuse.field());

    let casting = opt(seq(str("CASTING"), opt(alt(type, handle))));

    let ret = seq(str("ASSIGN"), source, str("TO"), Reuse.fs_target(), casting);

    return ret;
  }

}