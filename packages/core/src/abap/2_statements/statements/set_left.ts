import {IStatement} from "./_statement";
import {verNot, opts, seq} from "../combi";
import {Version} from "../../../version";
import {Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class SetLeft implements IStatement {

  public getMatcher(): IStatementRunnable {
    const column = seq("COLUMN", Source);
    return verNot(Version.Cloud, seq("SET LEFT SCROLL-BOUNDARY", opts(column)));
  }

}