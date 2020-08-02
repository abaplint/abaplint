import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, alt, sub} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {Enhancement} from "./enhancement";
import {Constants} from "./constants";
import {Types} from "./types";
import {Define} from "./define";

export class Data implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.DataBegin),
                    star(alt(sta(Statements.Data),
                             sub(new Data()),
                             sta(Statements.Include),
                             sta(Statements.Ranges),
                             sta(Statements.Constant),
                             sub(new Constants()),
                             sta(Statements.Type),
                             sub(new Types()),
                             sub(new Enhancement()),
                             sub(new Define()),
                             sta(Statements.IncludeType),
                             sta(Statements.TypePools),
                             sta(Statements.EnhancementPoint))),
                    sta(Statements.DataEnd));
  }

}