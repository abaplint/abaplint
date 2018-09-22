import {Statement} from "./statement";
import {verNot, str, seq, opt, per, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class EditorCall extends Statement {

  public static get_matcher(): IRunnable {
    let title = seq(str("TITLE"), new Source());

    let options = per(str("DISPLAY-MODE"), title);

    let ret = seq(str("EDITOR-CALL FOR"),
                  opt(str("REPORT")),
                  new Source(),
                  opt(options));

    return verNot(Version.Cloud, ret);
  }

}