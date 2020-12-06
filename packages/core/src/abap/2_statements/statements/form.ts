import {IStatement} from "./_statement";
import {seq, opts} from "../combi";
import {FormName, FormTables, FormUsing, FormChanging, FormRaising} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Form implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("FORM",
                    FormName,
                    opts(FormTables),
                    opts(FormUsing),
                    opts(FormChanging),
                    opts(FormRaising));

    return ret;
  }

}