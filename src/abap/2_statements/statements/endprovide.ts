import {IStatement} from "./_statement";
import {verNot, str, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

export class EndProvide implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("ENDPROVIDE");
    return verNot(Version.Cloud, ret);
  }

}