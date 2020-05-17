import {Identifier} from "../4_object_information/_identifier";
import {TypedIdentifier} from "./_typed_identifier";

export interface IFormDefinition extends Identifier {

  getParameters(): readonly TypedIdentifier[];
  getTablesParameters(): readonly TypedIdentifier[];
  getUsingParameters(): readonly TypedIdentifier[];
  getChangingParameters(): readonly TypedIdentifier[];

}