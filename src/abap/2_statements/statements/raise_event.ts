import {IStatement} from "./_statement";
import {str, seq, opt, IStatementRunnable} from "../combi";
import {ParameterListS, Field} from "../expressions";

export class RaiseEvent implements IStatement {

  public getMatcher(): IStatementRunnable {
    const exporting = seq(str("EXPORTING"), new ParameterListS());

    return seq(str("RAISE EVENT"), new Field(), opt(exporting));
  }

}