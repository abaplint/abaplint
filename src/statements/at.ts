import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class At extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let atNew = seq(str("NEW"), Reuse.field_sub());
    let atEnd = seq(str("END OF"), Reuse.field_sub());

    let ret = seq(str("AT"), alt(str("FIRST"), str("LAST"), atNew, atEnd));

    return ret;
  }

  public isStructure() {
    return true;
  }

  public indentationEnd(prev) {
    return 2;
  }

}