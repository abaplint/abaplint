import {Statement} from "./_statement";
import {verNot, str, seq, opt, IStatementRunnable} from "../combi";
import {Target, ParameterListS, Source, Dynamic} from "../expressions";
import {Version} from "../../version";

export class GetBadi extends Statement {

  public getMatcher(): IStatementRunnable {
    const filters = seq(str("FILTERS"), new ParameterListS());
    const context = seq(str("CONTEXT"), new Source());
    const type = seq(str("TYPE"), new Dynamic());

    const ret = seq(str("GET BADI"),
                    new Target(),
                    opt(type),
                    opt(filters),
                    opt(context));

    return verNot(Version.Cloud, ret);
  }

}