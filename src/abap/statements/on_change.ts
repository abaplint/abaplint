import {Statement} from "./statement";
import {verNot, str, seq, IRunnable, star} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../version";

export class OnChange extends Statement {

  public static get_matcher(): IRunnable {
    let or = seq(str("OR"), new Target());

    let ret = seq(str("ON CHANGE OF"), new Target(), star(or));

    return verNot(Version.Cloud, ret);
  }

}