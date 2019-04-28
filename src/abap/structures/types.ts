import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, alt, sub, beginEnd} from "./_combi";

export class Types extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.TypeBegin),
                    star(alt(sta(Statements.Type), sub(new Types()), sta(Statements.IncludeType))),
                    sta(Statements.TypeEnd));
  }

}