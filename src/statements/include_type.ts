import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class IncludeType extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("INCLUDE TYPE"), Reuse.typename(), opt(seq(str("AS"), Reuse.field())));
  }

}