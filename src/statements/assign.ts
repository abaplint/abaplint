import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class Assign extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let component = seq(str("COMPONENT"),
                        new Reuse.Source(),
                        str("OF STRUCTURE"),
                        new Reuse.Source());

    let source = alt(seq(new Reuse.Source(), opt(seq(new Reuse.Arrow(), new Reuse.Dynamic()))),
                     component,
                     seq(new Reuse.Dynamic(), opt(seq(new Reuse.Arrow(), new Reuse.Field()))));

    let type = seq(str("TYPE"), new Reuse.Dynamic());

    let handle = seq(str("TYPE HANDLE"), new Reuse.Field());

    let casting = opt(seq(str("CASTING"), opt(alt(type, handle))));

    let ret = seq(str("ASSIGN"), source, str("TO"), new Reuse.FSTarget(), casting);

    return ret;
  }

}