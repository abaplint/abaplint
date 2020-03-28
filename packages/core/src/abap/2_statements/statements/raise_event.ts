import {IStatement} from "./_statement";
import {str, seq, opt} from "../combi";
import {ParameterListS, Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class RaiseEvent implements IStatement {

  public getMatcher(): IStatementRunnable {
    const exporting = seq(str("EXPORTING"), new ParameterListS());

    return seq(str("RAISE EVENT"), new Field(), opt(exporting));
  }

}