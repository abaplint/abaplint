import {Pragma} from "./1_lexer/tokens";
import {Token} from "./1_lexer/tokens/_token";
import {AbstractFile} from "../files/_abstract_file";
import {IFile} from "../files/_ifile";
import {StructureNode, StatementNode} from "./nodes";
import {IABAPFileInformation} from "./4_file_information/_abap_file_information";

export class ABAPFile extends AbstractFile {
  private readonly tokens: readonly Token[];
  private readonly statements: readonly StatementNode[];
  private readonly structure: StructureNode | undefined;
  private readonly file: IFile;
  private readonly info: IABAPFileInformation;

  public constructor(file: IFile,
                     tokens: readonly Token[],
                     statements: readonly StatementNode[],
                     structure: StructureNode | undefined,
                     info: IABAPFileInformation) {

    super(file.getFilename());
    this.file       = file;
    this.tokens     = tokens;
    this.statements = statements;
    this.structure  = structure;
    this.info       = info;
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

  public getTokens(withPragmas = true): readonly Token[] {
    if (withPragmas === true) {
      return this.tokens;
    } else {
      const tokens: Token[] = [];
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