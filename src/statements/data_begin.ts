import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str  = Combi.str;
let seq  = Combi.seq;
let alt  = Combi.alt;

export class DataBegin extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let start = alt(str("CLASS-DATA"), str("DATA"));

    let structure = seq(str("BEGIN OF"), new Reuse.SimpleName());

    return seq(start, structure);
  }

}