import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd} from "./_combi";

export class TypeEnum extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.TypeEnumBegin),
                    star(sta(Statements.TypeEnum)),
                    sta(Statements.TypeEnumEnd));
  }

}