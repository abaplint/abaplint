import {IStatement} from "./_statement";
import {verNot, seq} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class BreakId implements IStatement {

  public getMatcher(): IStatementRunnable {
    const id = seq("ID", Field);

    const ret = seq("BREAK-POINT", id);

    return verNot(Version.Cloud, ret);
  }

}