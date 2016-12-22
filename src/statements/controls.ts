import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class Controls extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let tableview = seq(str("TABLEVIEW USING SCREEN"), new Reuse.Source());
    let tabstrip = str("TABSTRIP");
    let type = seq(str("TYPE"), alt(tableview, tabstrip));
    return seq(str("CONTROLS"), new Reuse.Target(), type);
  }

}