import {IStatement} from "./_statement";
import {verNot, str, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

export class EndModule implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("ENDMODULE");
    return verNot(Version.Cloud, ret);
  }

}