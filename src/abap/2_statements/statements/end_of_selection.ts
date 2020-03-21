import {IStatement} from "./_statement";
import {verNot, str, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

export class EndOfSelection implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("END-OF-SELECTION");

    return verNot(Version.Cloud, ret);
  }

}