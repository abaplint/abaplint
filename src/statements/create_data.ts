import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class CreateData extends Statement {

  public static get_matcher(): Combi.IRunnable {
// todo, similar to DATA or TYPES?
    let type = alt(str("LIKE"), str("TYPE"), str("TYPE HANDLE"), str("LIKE LINE OF"));
    let ret = seq(str("CREATE DATA"), Reuse.target(), type, Reuse.source());
    return ret;
  }

}