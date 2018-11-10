import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, alt, beginEnd} from "./_combi";

export class TypeEnum extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.TypeEnumBegin),
                    star(alt(sta(Statements.TypeEnum), sta(Statements.Type))),
                    sta(Statements.TypeEnumEnd));
  }

}