import {IStatement} from "./_statement";
import {verNot, seqs, opt, alts} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class NewLine implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("NEW-LINE",
                     opt(alts("SCROLLING", "NO-SCROLLING")));

    return verNot(Version.Cloud, ret);
  }

}