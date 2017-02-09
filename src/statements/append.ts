import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let opt = Combi.opt;
let alt = Combi.alt;
let seq = Combi.seq;

export class Append extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let assigning = seq(str("ASSIGNING"), new Reuse.FSTarget());
    let reference = seq(str("REFERENCE INTO"), new Reuse.Target());
    let sorted = seq(str("SORTED BY"), new Reuse.Field());

    let range = seq(str("FROM"), new Reuse.Source(), str("TO"), new Reuse.Source);

    return seq(str("APPEND"),
               alt(str("INITIAL LINE"), seq(opt(str("LINES OF")), new Reuse.Source())),
               opt(range),
               opt(seq(str("TO"),
                       new Reuse.Target(),
                       opt(alt(assigning, reference)))),
               opt(str("CASTING")),
               opt(sorted));
  }

}