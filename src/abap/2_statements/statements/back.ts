import {IStatement} from "./_statement";
import {verNot, str, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

export class Back implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("BACK");

    return verNot(Version.Cloud, ret);
  }

}