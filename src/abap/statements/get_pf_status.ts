import {Statement} from "./_statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class GetPFStatus extends Statement {

  public getMatcher(): IRunnable {
    const program = seq(str("PROGRAM"), new Source());
    const excl = seq(str("EXCLUDING"), new Source());

    const ret = seq(str("GET PF-STATUS"),
                    new Target(),
                    opt(program),
                    opt(excl));

    return verNot(Version.Cloud, ret);
  }

}