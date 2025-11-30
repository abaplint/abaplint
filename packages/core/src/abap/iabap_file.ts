import {AbstractToken} from "./1_lexer/tokens/abstract_token";
import {IABAPFileInformation} from "./4_file_information/_abap_file_information";
import {StatementNode, StructureNode} from "./nodes";

export interface IABAPFile {
  getInfo(): IABAPFileInformation;
  getStructure(): StructureNode | undefined;
  getTokens(withPragmas?: boolean): readonly AbstractToken[];
  getStatements(): readonly StatementNode[];
}