import {Statement} from "./_statement";
import {verNot, str, seq, opt, per, IStatementRunnable} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../../version";

export class GetDataset extends Statement {

  public getMatcher(): IStatementRunnable {
    const position = seq(str("POSITION"), new Target());
    const attr = seq(str("ATTRIBUTES"), new Target());

    const ret = seq(str("GET DATASET"),
                    new Target(),
                    opt(per(position, attr)));

    return verNot(Version.Cloud, ret);
  }

}