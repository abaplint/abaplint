import {IStatement} from "./_statement";
import {verNot, str, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

export class Detail implements IStatement {
  public getMatcher(): IStatementRunnable {
    const ret = str("DETAIL");

    return verNot(Version.Cloud, ret);
  }
}