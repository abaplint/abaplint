import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, alt, beginEnd} from "./_combi";

export class Types extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.TypeBegin),
                    star(alt(sta(Statements.Type), sta(Statements.IncludeType))),
                    sta(Statements.TypeEnd));
  }

}