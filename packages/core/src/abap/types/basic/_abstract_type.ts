import {Identifier} from "../../4_file_information/_identifier";

export interface AbstractType {
  toText(level: number): string;
  isGeneric(): boolean;
  containsVoid(): boolean;
  getIdentifier(): Identifier | undefined;
}