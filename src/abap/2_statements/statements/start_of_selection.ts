import {IStatement} from "./_statement";
import {verNot, str, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

export class StartOfSelection implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNot(Version.Cloud, str("START-OF-SELECTION"));
  }

}