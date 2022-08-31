import {IStatement} from "./_statement";
import {seq, opt, alt} from "../combi";
import {FormName, FormTables, FormUsing, FormChanging, FormRaising} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Form implements IStatement {

  public getMatcher(): IStatementRunnable {
    const parameters = seq(opt(FormTables),
                           opt(FormUsing),
                           opt(FormChanging),
                           opt(FormRaising));

    const ret = seq("FORM", FormName, alt("IMPLEMENTATION", parameters));

    return ret;
  }

}