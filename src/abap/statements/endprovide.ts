import {Statement} from "./_statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class EndProvide extends Statement {

  public getMatcher(): IRunnable {
    let ret = str("ENDPROVIDE");
    return verNot(Version.Cloud, ret);
  }

}