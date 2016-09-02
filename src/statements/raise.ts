import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class Raise extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let clas = seq(str("EXCEPTION"),
                   opt(str("TYPE")),
                   Reuse.class_name(),
                   opt(seq(str("EXPORTING"), Reuse.parameter_list_s())));

    return seq(str("RAISE"), alt(Reuse.field(), clas));
  }

}