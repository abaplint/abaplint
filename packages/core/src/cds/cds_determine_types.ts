import {AbstractType, IRegistry} from "..";
import {IStructureComponent, StructureType, UnknownType, VoidType} from "../abap/types/basic";
import {DDIC} from "../ddic";
import {ParsedDataDefinition} from "../objects";

export class CDSDetermineTypes {

  public parseType(reg: IRegistry, parsedData: ParsedDataDefinition): AbstractType {
    const ddic = new DDIC(reg);

    if (parsedData?.fields.length === 0) {
      return new VoidType("DDLS:todo");
    } else {
      const components: IStructureComponent[] = [];

      for (const f of parsedData?.fields || []) {
        if (f.prefix !== "") {
          let source = parsedData.sources.find((s) => s.as?.toUpperCase() === f.prefix.toUpperCase());
          if (source?.name === undefined) {
            source = parsedData.sources.find((s) => s.name.toUpperCase() === f.prefix.toUpperCase());
          }
          if (source?.name === undefined) {
            components.push({
              name: f.name,
              type: new UnknownType("CDS parser error, unknown source"),
            });
            continue;
          }

          const lookup = ddic.lookupTableOrView(source.name);
          if (lookup.type) {
            if (lookup.type instanceof StructureType) {
              const type = lookup.type.getComponentByName(f.name);
              if (type) {
                components.push({
                  name: f.name,
                  type: type,
                });
              } else {
                components.push({
                  name: f.name,
                  type: new UnknownType(f.name + " not found in " + source.name + ", CDSDetermineTypes"),
                });
              }
            } else {
              // its void or unknown
              components.push({
                name: f.name,
                type: lookup.type,
              });
            }
          } else if (reg.inErrorNamespace(source.name)) {
            components.push({
              name: f.name,
              type: new UnknownType(source.name + " not found, CDSDetermineTypes"),
            });
          } else {
            components.push({
              name: f.name,
              type: new VoidType(source.name),
            });
          }
        } else {
          components.push({
            name: f.name,
            type: new VoidType("DDLS:fieldname"),
          });
        }
      }
      return new StructureType(components, parsedData.definitionName, parsedData.definitionName, parsedData.description);
    }
  }

}