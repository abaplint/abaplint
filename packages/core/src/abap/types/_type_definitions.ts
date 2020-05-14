
import {TypedIdentifier} from "./_typed_identifier";

export interface ITypeDefinitions {

  getAll(): readonly TypedIdentifier[];
  getByName(name: string): TypedIdentifier | undefined;

}