import {IStatement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {Field, SimpleName} from "../expressions";

export class Aliases implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("ALIASES"),
               new SimpleName(),
               str("FOR"),
               new Field());
  }

}