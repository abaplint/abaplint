import {IStatement} from "./_statement";
import {seqs, optPrios} from "../combi";
import {DefinitionName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ConstantBegin implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("CONSTANTS BEGIN OF", DefinitionName, optPrios("%_PREDEFINED"));
    return ret;
  }

}