
import {Visibility} from "../4_file_information/visibility";
import {TypedIdentifier} from "./_typed_identifier";

export type TypeDefinitionsEntry = {type: TypedIdentifier, visibility: Visibility};

export interface ITypeDefinitions {

  getAll(): readonly TypeDefinitionsEntry[];
  getByName(name: string): TypedIdentifier | undefined;

}