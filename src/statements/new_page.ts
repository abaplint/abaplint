import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class NewPage extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let line = seq(str("LINE-SIZE"), new Reuse.Source());

    let print = seq(str("PRINT"), alt(str("OFF"), str("ON")));

    return seq(str("NEW-PAGE"),
               opt(print),
               opt(line));
  }

}