import {IStatement} from "./_statement";
import {seq} from "../combi";
import {DefinitionName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ConstantEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("CONSTANTS", "END", "OF", DefinitionName);

    return ret;
  }

}