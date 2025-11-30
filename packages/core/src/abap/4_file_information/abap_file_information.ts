import {IABAPFileInformation, InfoClassImplementation, InfoClassDefinition, InfoInterfaceDefinition, InfoFormDefinition} from "./_abap_file_information";
import {StructureNode} from "../nodes";
import {ABAPFileInformationParser} from "./abap_file_information_parser";

export class ABAPFileInformation implements IABAPFileInformation {
  private readonly interfaces: InfoInterfaceDefinition[];
  private readonly classes: InfoClassDefinition[];
  private readonly forms: InfoFormDefinition[];
  private readonly implementations: InfoClassImplementation[];

  public constructor(structure: StructureNode | undefined, filename: string) {
    const parser = new ABAPFileInformationParser(filename);
    const parsed = parser.parse(structure);
    this.forms = parsed.forms;
    this.implementations = parsed.implementations;
    this.interfaces = parsed.interfaces;
    this.classes = parsed.classes;
  }

  public listClassImplementations(): readonly InfoClassImplementation[] {
    return this.implementations;
  }

  public listInterfaceDefinitions(): readonly InfoInterfaceDefinition[] {
    return this.interfaces;
  }

  public getInterfaceDefinitionByName(name: string): InfoInterfaceDefinition | undefined {
    const upper = name.toUpperCase();
    for (const i of this.listInterfaceDefinitions()) {
      if (i.identifier.getName().toUpperCase() === upper) {
        return i;
      }
    }
    return undefined;
  }

  public listClassDefinitions(): readonly InfoClassDefinition[] {
    return this.classes;
  }

  public getClassDefinitionByName(name: string): InfoClassDefinition | undefined {
    const upper = name.toUpperCase();
    for (const d of this.listClassDefinitions()) {
      if (d.identifier.getName().toUpperCase() === upper) {
        return d;
      }
    }
    return undefined;
  }

  public getClassImplementationByName(name: string): InfoClassImplementation | undefined {
    const upper = name.toUpperCase();
    for (const impl of this.listClassImplementations()) {
      if (impl.identifier.getName().toUpperCase() === upper) {
        return impl;
      }
    }
    return undefined;
  }

  public listFormDefinitions(): InfoFormDefinition[] {
    return this.forms;
  }

}