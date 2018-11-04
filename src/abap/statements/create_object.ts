import {Statement} from "./_statement";
import {str, seq, opt, alt, per, IRunnable} from "../combi";
import {Target, ParameterListS, ParameterListExceptions, Source, ClassName, Dynamic} from "../expressions";

export class CreateObject extends Statement {

  public getMatcher(): IRunnable {
    let exporting = seq(str("EXPORTING"), new ParameterListS());
    let exceptions = seq(str("EXCEPTIONS"), new ParameterListExceptions());
    let table = seq(str("PARAMETER-TABLE"), new Source());
    let area = seq(str("AREA HANDLE"), new Source());
    let type = seq(str("TYPE"), alt(new ClassName(), new Dynamic()));

    let ret = seq(str("CREATE OBJECT"),
                  new Target(),
                  opt(per(type, area)),
                  opt(alt(exporting, table)),
                  opt(exceptions));

    return ret;
  }

}