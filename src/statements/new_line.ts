import {Statement} from "./statement";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class NewLine extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("NEW-LINE"),
               opt(alt(str("SCROLLING"), str("NO-SCROLLING"))));
  }

}