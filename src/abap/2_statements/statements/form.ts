import {IStatement} from "./_statement";
import {str, seq, opt} from "../combi";
import {FormName, FormTables, FormUsing, FormChanging, FormRaising} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Form implements IStatement {

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