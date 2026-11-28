import {AbstractType, IRegistry} from "..";
import {IStructureComponent, StructureType, UnknownType, VoidType} from "../abap/types/basic";
import {DDIC} from "../ddic";
import {ParsedDataDefinition} from "../objects";

export class CDSDetermineTypes {

  public parseType(reg: IRegistry, parsedData: ParsedDataDefinition, ddlsName: string): AbstractType {
    const ddic = new DDIC(reg);

    if (parsedData?.fields.length === 0) {
      return VoidType.get("DDLS:todo");
    } else {
      const components: IStructureComponent[] = [];

      for (const f of parsedData?.fields || []) {
        if (f.prefix !== "") {
          const prefixUpper = f.prefix.toUpperCase();
          if (prefixUpper === "$PARAMETERS") {
            components.push({
              name: f.name,
              type: this.parameterType(ddic, parsedData, f.nameInSource ?? f.name, ddlsName),
            });
            continue;
          } else if (prefixUpper === "$SESSION") {
            components.push({
              name: f.name,
              type: this.sessionType(ddic, f.nameInSource ?? f.name, ddlsName),
            });
            continue;
          }

          let source = parsedData.sources.find((s) => s.as?.toUpperCase() === prefixUpper);
          if (source?.name === undefined) {
            source = parsedData.sources.find((s) => s.name.toUpperCase() === prefixUpper);
          }
          if (source?.name === undefined) {
            // not a source, so its a path via an association, either defined in this view or exposed by a source
            components.push({
              name: f.name,
              type: VoidType.get("DDLS:association"),
            });
            continue;
          }

          const nameInSource = f.nameInSource ?? f.name;
          const lookup = ddic.lookupTableOrView(source.name);
          if (lookup.type) {
            if (lookup.type instanceof StructureType) {
              const type = lookup.type.getComponentByName(nameInSource);
              if (type) {
                components.push({
                  name: f.name,
                  type: type,
                });
              } else {
                components.push({
                  name: f.name,
                  type: new UnknownType(nameInSource + " not found in " + source.name + ", CDSDetermineTypes"),
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
              type: VoidType.get(source.name),
            });
          }
        } else {
          components.push({
            name: f.name,
            type: this.findInSources(ddic, parsedData, f.nameInSource) ?? VoidType.get("DDLS:fieldname:" + ddlsName),
          });
        }
      }
      return new StructureType(components, parsedData.definitionName, parsedData.definitionName, parsedData.description);
    }
  }

  /** "$parameters.name", the type of the parameter, either "abap.type(length, decimals)" or a data element */
  private parameterType(ddic: DDIC, parsedData: ParsedDataDefinition, name: string, ddlsName: string): AbstractType {
    const parameter = parsedData.parameters.find(p => p.name.toUpperCase() === name.toUpperCase());
    if (parameter === undefined) {
      return VoidType.get("DDLS:parameter:" + ddlsName);
    }

    const builtin = parameter.type.match(/^abap\s*\.\s*(\w+)\s*(?:\(\s*(\d+)\s*(?:,\s*(\d+)\s*)?\))?$/i);
    if (builtin) {
      const type = ddic.textToType({
        text: builtin[1].toUpperCase(),
        length: builtin[2],
        decimals: builtin[3],
        infoText: ddlsName,
      });
      return type instanceof UnknownType ? VoidType.get("DDLS:parameter:" + ddlsName) : type;
    }

    return ddic.lookupDataElement(parameter.type.replace(/\s/g, "")).type;
  }

  /** "$session.name" */
  private sessionType(ddic: DDIC, name: string, ddlsName: string): AbstractType {
    const types: {[name: string]: {text: string, length: string | undefined}} = {
      "CLIENT": {text: "CLNT", length: undefined},
      "SYSTEM_DATE": {text: "DATS", length: undefined},
      "SYSTEM_LANGUAGE": {text: "LANG", length: undefined},
      "USER": {text: "CHAR", length: "12"},
      "USER_DATE": {text: "DATS", length: undefined},
      "USER_TIMEZONE": {text: "CHAR", length: "6"},
    };
    const found = types[name.toUpperCase()];
    if (found === undefined) {
      return VoidType.get("DDLS:session:" + ddlsName);
    }
    return ddic.textToType({...found, decimals: undefined, infoText: ddlsName});
  }

  /** unprefixed field, take the type from the first source containing it, void or unknown sources are skipped */
  private findInSources(ddic: DDIC, parsedData: ParsedDataDefinition, nameInSource: string | undefined): AbstractType | undefined {
    if (nameInSource === undefined) {
      return undefined;
    }
    for (const source of parsedData.sources) {
      const lookup = ddic.lookupTableOrView(source.name);
      if (lookup.type instanceof StructureType) {
        const type = lookup.type.getComponentByName(nameInSource);
        if (type) {
          return type;
        }
      }
    }
    return undefined;
  }

}