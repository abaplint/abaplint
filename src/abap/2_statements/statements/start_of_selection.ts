import {Statement} from "./_statement";
import {verNot, str, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

export class StartOfSelection extends Statement {

  public getMatcher(): IStatementRunnable {
    return verNot(Version.Cloud, str("START-OF-SELECTION"));
  }

}