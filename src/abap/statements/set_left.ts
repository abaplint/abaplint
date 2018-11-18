import {Statement} from "./_statement";
import {verNot, str, IRunnable, opt, seq} from "../combi";
import {Version} from "../../version";
import {Source} from "../expressions";

export class SetLeft extends Statement {

  public getMatcher(): IRunnable {
    const column = seq(str("COLUMN"), new Source());
    return verNot(Version.Cloud, seq(str("SET LEFT SCROLL-BOUNDARY"), opt(column)));
  }

}