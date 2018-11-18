import {Statement} from "./_statement";
import {verNot, str, seq, IRunnable, star} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../version";

export class OnChange extends Statement {

  public getMatcher(): IRunnable {
    const or = seq(str("OR"), new Target());

    const ret = seq(str("ON CHANGE OF"), new Target(), star(or));

    return verNot(Version.Cloud, ret);
  }

}