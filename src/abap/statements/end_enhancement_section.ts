import {Statement} from "./_statement";
import {verNot, str, IStatementRunnable} from "../combi";
import {Version} from "../../version";

export class EndEnhancementSection extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = str("END-ENHANCEMENT-SECTION");

    return verNot(Version.Cloud, ret);
  }

}