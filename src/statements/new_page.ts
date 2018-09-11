import {Statement} from "./statement";
import {str, seq, alt, per, opt, IRunnable} from "../combi";
import {Source} from "../expressions";

export class NewPage extends Statement {

  public static get_matcher(): IRunnable {
    let line = seq(str("LINE-SIZE"), new Source());
    let print = seq(str("PRINT"), alt(str("OFF"), str("ON")));
    let parameters = seq(str("PARAMETERS"), new Source());
    let archive = seq(str("ARCHIVE PARAMETERS"), new Source());
    let lineCount = seq(str("LINE-COUNT"), new Source());

    return seq(str("NEW-PAGE"),
               opt(per(print,
                       alt(str("NO-TITLE"), str("WITH-TITLE")),
                       alt(str("NO-HEADING"), str("WITH-HEADING")),
                       str("NO DIALOG"),
                       parameters,
                       archive,
                       str("NEW-SECTION"),
                       lineCount,
                       line)));
  }

}