import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let per = Combi.per;
let alt = Combi.alt;
let seq = Combi.seq;

export class Format extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let eq = seq(str("="), new Reuse.Source());

    let options = per(str("RESET"),
                      seq(str("INTENSIFIED"), eq),
                      seq(str("INVERSE"), eq),
                      seq(str("COLOR"), alt(eq, new Reuse.Field())));
    return seq(str("FORMAT"), options);
  }

}