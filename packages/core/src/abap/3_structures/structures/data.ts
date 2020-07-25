import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, alt, sub} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class Data implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.DataBegin),
                    star(alt(sta(Statements.Data), sta(Statements.EnhancementPoint), sub(new Data()), sta(Statements.IncludeType))),
                    sta(Statements.DataEnd));
  }

}