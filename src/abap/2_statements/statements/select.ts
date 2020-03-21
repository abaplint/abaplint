import {IStatement} from "./_statement";
import {seq, opt} from "../combi";
import {Select as eSelect, SQLHints} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Select implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(new eSelect(), opt(new SQLHints()));
  }

}