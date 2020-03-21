import {IStatement} from "./_statement";
import {verNot, str, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

export class SuppressDialog implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("SUPPRESS DIALOG");

    return verNot(Version.Cloud, ret);
  }

}