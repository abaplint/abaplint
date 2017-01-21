import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let per = Combi.per;

export class EditorCall extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let title = seq(str("TITLE"), new Reuse.Source());

    let options = per(str("DISPLAY-MODE"), title);

    return seq(str("EDITOR-CALL FOR"),
               opt(str("REPORT")),
               new Reuse.Source(),
               opt(options));
  }

}