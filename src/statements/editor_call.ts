import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, per, IRunnable} from "../combi";

export class EditorCall extends Statement {

  public static get_matcher(): IRunnable {
    let title = seq(str("TITLE"), new Reuse.Source());

    let options = per(str("DISPLAY-MODE"), title);

    return seq(str("EDITOR-CALL FOR"),
               opt(str("REPORT")),
               new Reuse.Source(),
               opt(options));
  }

}