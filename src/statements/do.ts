import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let opt = Combi.opt;
let seq = Combi.seq;

export class Do extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let vary = seq(str("VARYING FIELD FROM"),
                   new Reuse.Source(),
                   str("NEXT"),
                   new Reuse.Source());

    return seq(str("DO"), opt(seq(new Reuse.Source(), str("TIMES"), opt(vary))));
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 2;
  }

}