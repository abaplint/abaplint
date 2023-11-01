import {Pragma} from "./1_lexer/tokens";
import {AbstractToken} from "./1_lexer/tokens/abstract_token";
import {AbstractFile} from "../files/_abstract_file";
import {IFile} from "../files/_ifile";
import {StructureNode, StatementNode} from "./nodes";
import {IABAPFileInformation} from "./4_file_information/_abap_file_information";

export class ABAPFile extends AbstractFile {
  private readonly tokens: readonly AbstractToken[];
  private readonly statements: readonly StatementNode[];
  private readonly structure: StructureNode | undefined;
  private readonly file: IFile;
  private readonly info: IABAPFileInformation;

  public constructor(file: IFile,
                     tokens: readonly AbstractToken[],
                     statements: readonly StatementNode[],
                     structure: StructureNode | undefined,
                     info: IABAPFileInformation) {

    super(file.getFilename());
    this.file = file;
    this.tokens = tokens;
    this.statements = statements;
    this.structure = structure;
    this.info = info;
  }

  public getRaw(): string {
    return this.file.getRaw();
  }

  public getInfo(): IABAPFileInformation {
    return this.info;
  }

  public getRawRows(): string[] {
    return this.file.getRawRows();
  }

  public getStructure(): StructureNode | undefined {
    return this.structure;
  }

  public getTokens(withPragmas = true): readonly AbstractToken[] {
    if (withPragmas === true) {
      return this.tokens;
    } else {
      const tokens: AbstractToken[] = [];
      this.tokens.forEach((t) => {
        if (!(t instanceof Pragma)) {
          tokens.push(t);
        }
      });
      return tokens;
    }
  }

  public getStatements(): readonly StatementNode[] {
    return this.statements;
  }

}