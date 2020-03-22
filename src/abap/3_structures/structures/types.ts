import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, alt, sub, beginEnd} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class Types implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.TypeBegin),
                    star(alt(sta(Statements.Type), sub(new Types()), sta(Statements.IncludeType))),
                    sta(Statements.TypeEnd));
  }

}