import {IABAPFileInformation, InfoClassImplementation, InfoClassDefinition, InfoInterfaceDefinition, InfoFormDefinition} from "./_abap_file_information";
import {ParsedFileInformation} from "./parsed_file_information";

export class ABAPFileInformation implements IABAPFileInformation {
  private readonly parsed: ParsedFileInformation;

  public constructor(parsed: ParsedFileInformation) {
    this.parsed = parsed;
  }

  public listClassImplementations(): readonly InfoClassImplementation[] {
    return this.parsed.implementations;
  }

  public listInterfaceDefinitions(): readonly InfoInterfaceDefinition[] {
    return this.parsed.interfaces;
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
    return this.parsed.classes;
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
    return this.parsed.forms;
  }

}