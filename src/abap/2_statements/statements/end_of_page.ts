import {IStatement} from "./_statement";
import {verNot, str, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

export class EndOfPage implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("END-OF-PAGE");

    return verNot(Version.Cloud, ret);
  }

}