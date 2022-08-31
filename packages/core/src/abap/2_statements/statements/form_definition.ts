import {IStatement} from "./_statement";
import {seq, opt} from "../combi";
import {FormName, FormTables, FormUsing, FormChanging, FormRaising} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class FormDefinition implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("FORM",
                    FormName,
                    "DEFINITION",
                    opt(FormTables),
                    opt(FormUsing),
                    opt(FormChanging),
                    opt(FormRaising));

    return ret;
  }

}