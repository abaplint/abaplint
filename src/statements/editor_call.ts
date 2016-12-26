import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class EditorCall extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let title = seq(str("TITLE"), new Reuse.Source());

    return seq(str("EDITOR-CALL FOR"),
               opt(str("REPORT")),
               new Reuse.Source(),
               opt(str("DISPLAY-MODE")),
               opt(title));
  }

}