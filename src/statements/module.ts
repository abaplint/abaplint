import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class Module extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("MODULE"), Reuse.form_name(), alt(str("INPUT"), str("OUTPUT")));
  }

}