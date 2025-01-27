import {AbstractType, IRegistry} from "..";
import {IStructureComponent, StructureType, UnknownType, VoidType} from "../abap/types/basic";
import {DDIC} from "../ddic";
import {ParsedDataDefinition} from "../objects";

export class CDSDetermineTypes {

  public parseType(reg: IRegistry, parsedData: ParsedDataDefinition, ddlsName: string): AbstractType {
    const ddic = new DDIC(reg);

    if (parsedData?.fields.length === 0) {
      return new VoidType("DDLS:todo");
    } else {
      const components: IStructureComponent[] = [];

      for (const f of parsedData?.fields || []) {
        if (f.prefix !== "") {
          const prefixUpper = f.prefix.toUpperCase();
          let source = parsedData.sources.find((s) => s.as?.toUpperCase() === prefixUpper);
          if (source?.name === undefined) {
            source = parsedData.sources.find((s) => s.name.toUpperCase() === prefixUpper);
          }
          if (source?.name === undefined
              && (parsedData.associations.find((s) => s.name.toUpperCase() === prefixUpper)
              || parsedData.associations.find((s) => s.as?.toUpperCase() === prefixUpper))) {
            components.push({
              name: f.name,
              type: new VoidType("DDLS:association"),
            });
            continue;
          }
          if (source?.name === undefined) {
            if (prefixUpper.startsWith("_")) {
              components.push({
                name: f.name,
                type: new VoidType("DDLS:association"),
              });
              continue;
            }
            components.push({
              name: f.name,
              type: new UnknownType("CDS parser error, unknown source, " + ddlsName),
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
            type: new VoidType("DDLS:fieldname:" + ddlsName),
          });
        }
      }
      return new StructureType(components, parsedData.definitionName, parsedData.definitionName, parsedData.description);
    }
  }

}