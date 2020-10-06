import {Identifier} from "../4_file_information/_identifier";
import {TypedIdentifier} from "./_typed_identifier";

export interface IFormDefinition extends Identifier {

  getTablesParameters(): readonly TypedIdentifier[];
  getUsingParameters(): readonly TypedIdentifier[];
  getChangingParameters(): readonly TypedIdentifier[];

}