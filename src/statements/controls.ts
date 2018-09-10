import {Statement} from "./statement";
import {str, seq, alt, IRunnable} from "../combi";
import * as Reuse from "./reuse";
import {Target} from "../expressions";

export class Controls extends Statement {

  public static get_matcher(): IRunnable {
    let tableview = seq(str("TABLEVIEW USING SCREEN"), new Reuse.Source());
    let tabstrip = str("TABSTRIP");
    let type = seq(str("TYPE"), alt(tableview, tabstrip));
    return seq(str("CONTROLS"), new Target(), type);
  }

}