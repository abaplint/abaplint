import {IStatement} from "./_statement";
import {seqs, opt} from "../combi";
import {ParameterListS, Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class RaiseEvent implements IStatement {

  public getMatcher(): IStatementRunnable {
    const exporting = seqs("EXPORTING", ParameterListS);

    return seqs("RAISE EVENT", Field, opt(exporting));
  }

}