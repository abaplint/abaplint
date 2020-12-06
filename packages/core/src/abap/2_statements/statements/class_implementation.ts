import {IStatement} from "./_statement";
import {seq} from "../combi";
import {ClassName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassImplementation implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("CLASS", ClassName, "IMPLEMENTATION");
  }

}