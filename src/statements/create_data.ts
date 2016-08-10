import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class CreateData extends Statement {

  public static get_matcher(): Combi.IRunnable {
// todo, similar to DATA or TYPES?
    let type = alt(str("LIKE"),
                   str("TYPE"),
                   str("TYPE HANDLE"),
                   str("TYPE STANDARD TABLE OF"),
                   str("LIKE LINE OF"));

    let ret = seq(str("CREATE DATA"), Reuse.target(), type, alt(Reuse.source(), Reuse.dynamic()));

    return ret;
  }

}