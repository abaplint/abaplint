import {IStatement} from "./_statement";
import {seq, opt} from "../combi";
import {ParameterListS, Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class RaiseEvent implements IStatement {

  public getMatcher(): IStatementRunnable {
    const exporting = seq("EXPORTING", ParameterListS);

    return seq("RAISE EVENT", Field, opt(exporting));
  }

}