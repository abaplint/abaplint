import {IStatement} from "./_statement";
import {seqs, opt} from "../combi";
import {FormName, FormTables, FormUsing, FormChanging, FormRaising} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Form implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("FORM",
                     FormName,
                     opt(new FormTables()),
                     opt(new FormUsing()),
                     opt(new FormChanging()),
                     opt(new FormRaising()));

    return ret;
  }

}