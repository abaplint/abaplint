import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let alt = Combi.alt;
let seq = Combi.seq;

export class Format extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("FORMAT"), alt(str("RESET"), seq(str("COLOR"), new Reuse.Field())));
  }

}