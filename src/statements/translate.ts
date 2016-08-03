import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;


export class Translate extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let cas = seq(str("TO"),
                  alt(str("UPPER"), str("LOWER")),
                  str("CASE"));
    let using = seq(str("USING"), Reuse.source());
    return seq(str("TRANSLATE"),
               Reuse.target(),
               alt(cas, using));
  }

}