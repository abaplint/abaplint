import {Statement} from "./_statement";
import {verNot, str, seq, opt, per, IRunnable} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../version";

export class GetDataset extends Statement {

  public getMatcher(): IRunnable {
    let position = seq(str("POSITION"), new Target());
    let attr = seq(str("ATTRIBUTES"), new Target());

    let ret = seq(str("GET DATASET"),
                  new Target(),
                  opt(per(position, attr)));

    return verNot(Version.Cloud, ret);
  }

}