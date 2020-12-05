import {IStatement} from "./_statement";
import {verNot, seqs} from "../combi";
import {SQLSource} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CloseCursor implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("CLOSE CURSOR", SQLSource);
    return verNot(Version.Cloud, ret);
  }

}