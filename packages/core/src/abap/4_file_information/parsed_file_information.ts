import {InfoClassImplementation, InfoClassDefinition, InfoInterfaceDefinition, InfoFormDefinition} from "./_abap_file_information";

export interface ParsedFileInformation {
  interfaces: InfoInterfaceDefinition[];
  classes: InfoClassDefinition[];
  forms: InfoFormDefinition[];
  implementations: InfoClassImplementation[];
}