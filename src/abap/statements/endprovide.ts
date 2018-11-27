import {Statement} from "./_statement";
import {verNot, str, IStatementRunnable} from "../combi";
import {Version} from "../../version";

export class EndProvide extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = str("ENDPROVIDE");
    return verNot(Version.Cloud, ret);
  }

}