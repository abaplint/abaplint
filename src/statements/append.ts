import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let opt = Combi.opt;
let alt = Combi.alt;
let seq = Combi.seq;

export class Append extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let assigning = seq(str("ASSIGNING"), new Reuse.Target());
    let reference = seq(str("REFERENCE INTO"), new Reuse.Target());

    return seq(str("APPEND"),
               alt(str("INITIAL LINE"), seq(opt(str("LINES OF")), new Reuse.Source())),
               opt(seq(str("TO"),
                       new Reuse.Target(),
                       opt(alt(assigning, reference)))));
  }

}