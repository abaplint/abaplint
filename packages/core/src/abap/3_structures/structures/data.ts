import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, alt, sub} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {Enhancement} from "./enhancement";

export class Data implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.DataBegin),
                    star(alt(sta(Statements.Data),
                             sub(new Data()),
                             sub(new Enhancement()),
                             sta(Statements.IncludeType),
                             sta(Statements.TypePools),
                             sta(Statements.EnhancementPoint))),
                    sta(Statements.DataEnd));
  }

}