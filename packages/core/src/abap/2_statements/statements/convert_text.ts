import {IStatement} from "./_statement";
import {seq} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ConvertText implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("CONVERT TEXT",
               Source,
               "INTO SORTABLE CODE",
               Target);
  }

}