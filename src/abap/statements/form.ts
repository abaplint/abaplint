import {Statement} from "./_statement";
import {str, seq, opt, IStatementRunnable} from "../combi";
import {FormName, FormTables, FormUsing, FormChanging, FormRaising} from "../expressions";

export class Form extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("FORM"),
                    new FormName(),
                    opt(new FormTables()),
                    opt(new FormUsing()),
                    opt(new FormChanging()),
                    opt(new FormRaising()));

    return ret;
  }

}