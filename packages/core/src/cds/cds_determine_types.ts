import {AbstractType, IRegistry} from "..";
import {IStructureComponent, StructureType, VoidType} from "../abap/types/basic";
import {ParsedDataDefinition} from "../objects";

export class CDSDetermineTypes {

  public parseType(_reg: IRegistry, parsedData: ParsedDataDefinition): AbstractType {

    if (parsedData?.fields.length === 0) {
      return new VoidType("DDLS:todo");
    } else {
      const components: IStructureComponent[] = [];
      for (const f of parsedData?.fields || []) {
        components.push({
          name: f.name,
          type: new VoidType("DDLS:fieldname"),
        });
      }
      return new StructureType(components);
    }
  }

}