import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let opt = Combi.opt;
let seq = Combi.seq;

export class Do extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("DO"), opt(seq(new Reuse.Source(), str("TIMES"))));
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 2;
  }

}