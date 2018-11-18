import {Statement} from "./_statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class EndEnhancementSection extends Statement {

  public getMatcher(): IRunnable {
    const ret = str("END-ENHANCEMENT-SECTION");

    return verNot(Version.Cloud, ret);
  }

}