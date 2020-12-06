import {IStatement} from "./_statement";
import {verNot, seq, opts, alts} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class NewLine implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("NEW-LINE",
                    opts(alts("SCROLLING", "NO-SCROLLING")));

    return verNot(Version.Cloud, ret);
  }

}