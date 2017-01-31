import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let per = Combi.per;
let alt = Combi.alt;
let seq = Combi.seq;
let opt = Combi.opt;

export class Format extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let eq = seq(str("="), new Reuse.Source());
    let value = alt(eq, new Reuse.Source());
    let toggle = alt(str("ON"), str("OFF"));

    let options = per(str("RESET"),
                      seq(str("INTENSIFIED"), opt(value)),
                      seq(str("INVERSE"), opt(value)),
                      seq(str("HOTSPOT"), opt(value)),
                      seq(str("FRAMES"), value),
                      seq(str("INPUT"), value),
                      seq(str("COLOR"), value, opt(toggle)));
    return seq(str("FORMAT"), options);
  }

}