import {Statement} from "./_statement";
import {str, verNot, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

export class CheckSelectOptions extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = str("CHECK SELECT-OPTIONS");

    return verNot(Version.Cloud, ret);
  }

}