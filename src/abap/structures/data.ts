import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd, alt, sub} from "./_combi";

export class Data extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.DataBegin),
                    star(alt(sta(Statements.Data), sub(new Data), sta(Statements.IncludeType))),
                    sta(Statements.DataEnd));
  }

}