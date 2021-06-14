import {IStatement} from "./_statement";
import {verNot, seq, optPrio} from "../combi";
import {WriteOffsetLength} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Uline implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("ULINE", optPrio(WriteOffsetLength), optPrio("NO-GAP"));

    return verNot(Version.Cloud, ret);
  }

}