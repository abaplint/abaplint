import { Statement } from "./statement";
import { Case } from "./case";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let star = Combi.star;

export class When extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("WHEN"), Reuse.source(), star(seq(str("OR"), Reuse.source())));
  }

  public isStructure() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof Case;
  }

}