import {Statement} from "./_statement";
import {verNot, str, seq, opt, IStatementRunnable} from "../combi";
import {Source, ParameterListS, FieldSub} from "../expressions";
import {Version} from "../../../version";

export class GetProperty extends Statement {

  public getMatcher(): IStatementRunnable {
    const exporting = seq(str("EXPORTING"), new ParameterListS());

    const ret = seq(str("GET PROPERTY OF"),
                    new FieldSub(),
                    new Source(),
                    str("="),
                    new Source(),
                    opt(str("NO FLUSH")),
                    opt(exporting));

    return verNot(Version.Cloud, ret);
  }

}