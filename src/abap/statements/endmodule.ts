import {Statement} from "./_statement";
import {verNot, str, IStatementRunnable} from "../combi";
import {Version} from "../../version";

export class EndModule extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = str("ENDMODULE");
    return verNot(Version.Cloud, ret);
  }

}