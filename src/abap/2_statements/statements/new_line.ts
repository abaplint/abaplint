import {Statement} from "./_statement";
import {verNot, str, seq, opt, alt, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

export class NewLine extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("NEW-LINE"),
                    opt(alt(str("SCROLLING"), str("NO-SCROLLING"))));

    return verNot(Version.Cloud, ret);
  }

}