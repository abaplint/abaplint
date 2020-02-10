import {Statement} from "./_statement";
import {seq, opt, IStatementRunnable} from "../combi";
import {Select as eSelect, SQLHints} from "../expressions";

export class Select extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(new eSelect(), opt(new SQLHints()));
  }

}