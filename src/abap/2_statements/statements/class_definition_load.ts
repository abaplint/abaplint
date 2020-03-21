import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {ClassName} from "../expressions";

export class ClassDefinitionLoad extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("CLASS"), new ClassName(), str("DEFINITION LOAD"));
  }

}