import {IStatement} from "./_statement";
import {verNot, str} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class EndOfSelection implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("END-OF-SELECTION");

    return verNot(Version.Cloud, ret);
  }

}