import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, alt, beginEnd} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class TypeEnum implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.TypeEnumBegin),
                    star(alt(sta(Statements.TypeEnum), sta(Statements.Type))),
                    sta(Statements.TypeEnumEnd));
  }

}