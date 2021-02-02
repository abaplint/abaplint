import {IStructure} from "./_structure";
import * as Statements from "../../2_statements/statements";
import {star, alt, sta, sub} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {Types} from "./types";
import {Constants} from "./constants";
import {TypeEnum} from "./type_enum";
import {ClassData} from "./class_data";
import {Data} from "./data";

export class SectionContents implements IStructure {

  public getMatcher(): IStructureRunnable {
    return star(alt(sta(Statements.MethodDef),
                    sta(Statements.InterfaceDef),
                    sta(Statements.Data),
                    sta(Statements.ClassData),
                    sta(Statements.Events),
                    sta(Statements.Constant),
                    sta(Statements.Aliases),
                    sta(Statements.TypePools),
                    sta(Statements.InterfaceLoad),
                    sta(Statements.ClassDefinitionLoad),
                    sub(Types),
                    sub(Constants),
                    sub(TypeEnum),
                    sub(Data),
                    sub(ClassData),
                    sta(Statements.Type)));
  }
}