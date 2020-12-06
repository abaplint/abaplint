import {IStatement} from "./_statement";
import {verNot, seq, opt, alt} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class NewLine implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("NEW-LINE",
                    opt(alt("SCROLLING", "NO-SCROLLING")));

    return verNot(Version.Cloud, ret);
  }

}