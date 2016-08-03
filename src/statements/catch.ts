import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let opt = Combi.opt;
let seq = Combi.seq;
let plus = Combi.plus;

export class Catch extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("CATCH"), plus(Reuse.field()), opt(seq(str("INTO"), Reuse.target())));
  }

}