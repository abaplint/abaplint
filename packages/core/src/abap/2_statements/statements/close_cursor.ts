import {IStatement} from "./_statement";
import {verNot, seq} from "../combi";
import {SQLSourceSimple} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CloseCursor implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("CLOSE CURSOR", SQLSourceSimple);
    return verNot(Version.Cloud, ret);
  }

}