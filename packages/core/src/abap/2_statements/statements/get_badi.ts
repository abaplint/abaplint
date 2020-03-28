import {IStatement} from "./_statement";
import {verNot, str, seq, opt} from "../combi";
import {Target, ParameterListS, Source, Dynamic} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetBadi implements IStatement {

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