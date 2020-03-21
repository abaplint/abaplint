import {IStatement} from "./_statement";
import {str, verNot, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

export class CheckSelectOptions implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("CHECK SELECT-OPTIONS");

    return verNot(Version.Cloud, ret);
  }

}