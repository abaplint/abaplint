import {IStatement} from "./_statement";
import {str, seq} from "../combi";
import {DefinitionName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ConstantEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("CONSTANTS"), str("END"), str("OF"), new DefinitionName());

    return ret;
  }

}