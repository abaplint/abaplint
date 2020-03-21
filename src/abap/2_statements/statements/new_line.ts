import {IStatement} from "./_statement";
import {verNot, str, seq, opt, alt} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class NewLine implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("NEW-LINE"),
                    opt(alt(str("SCROLLING"), str("NO-SCROLLING"))));

    return verNot(Version.Cloud, ret);
  }

}