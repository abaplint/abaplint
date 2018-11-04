import {Statement} from "./_statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class EndModule extends Statement {

  public getMatcher(): IRunnable {
    let ret = str("ENDMODULE");
    return verNot(Version.Cloud, ret);
  }

}