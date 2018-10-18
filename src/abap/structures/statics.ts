import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd, alt} from "./_combi";

export class Statics extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.StaticBegin),
                    star(alt(sta(Statements.Static), sta(Statements.IncludeType))),
                    sta(Statements.StaticEnd));
  }

}