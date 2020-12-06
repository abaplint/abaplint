import {IStatement} from "./_statement";
import {verNot, seq} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Free implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("FREE", Target);

    return verNot(Version.Cloud, ret);
  }

}