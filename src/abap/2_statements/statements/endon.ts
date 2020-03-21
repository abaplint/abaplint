import {IStatement} from "./_statement";
import {verNot, str, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

export class EndOn implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("ENDON");
    return verNot(Version.Cloud, ret);
  }

}