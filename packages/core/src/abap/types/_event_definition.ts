import {TypedIdentifier} from "./_typed_identifier";

export interface IEventDefinition {
  getName(): string;
  getParameters(): readonly TypedIdentifier[];
}