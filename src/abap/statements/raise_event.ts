import {Statement} from "./_statement";
import {str, seq, opt, IRunnable} from "../combi";
import {ParameterListS, Field} from "../expressions";

export class RaiseEvent extends Statement {

  public getMatcher(): IRunnable {
    let exporting = seq(str("EXPORTING"), new ParameterListS());

    return seq(str("RAISE EVENT"), new Field(), opt(exporting));
  }

}