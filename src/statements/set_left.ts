import {Statement} from "./statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../version";

export class SetLeft extends Statement {

  public static get_matcher(): IRunnable {
    return verNot(Version.Cloud, str("SET LEFT SCROLL-BOUNDARY"));
  }

}