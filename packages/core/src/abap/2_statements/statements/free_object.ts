import {IStatement} from "./_statement";
import {verNot, seq, opt} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class FreeObject implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("FREE OBJECT", Target, opt("NO FLUSH"));

    return verNot(Version.Cloud, ret);
  }

}