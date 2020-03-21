import {IStatement} from "./_statement";
import {str, seq} from "../combi";
import {Field, SimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Aliases implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("ALIASES"),
               new SimpleName(),
               str("FOR"),
               new Field());
  }

}