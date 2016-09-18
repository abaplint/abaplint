import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class Interface extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("INTERFACE"),
               new Reuse.Field(),
               opt(alt(str("PUBLIC"), str("LOAD"))));
  }

  public indentationEnd(prev) {
    return 2;
  }

}