import {Statement} from "./statement";
import {str, seq, opt, per, IRunnable} from "../combi";
import {Source} from "../expressions";

export class EditorCall extends Statement {

  public static get_matcher(): IRunnable {
    let title = seq(str("TITLE"), new Source());

    let options = per(str("DISPLAY-MODE"), title);

    return seq(str("EDITOR-CALL FOR"),
               opt(str("REPORT")),
               new Source(),
               opt(options));
  }

}