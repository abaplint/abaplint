import {ExpressionNode} from "../abap/nodes";
import {CDSParser} from "../cds/cds_parser";
import {AbstractObject} from "./_abstract_object";
import {IParseResult} from "./_iobject";

export type ParsedMetadataExtension = {
  tree: ExpressionNode | undefined;
};


export class CDSMetadataExtension extends AbstractObject {
  private parserError: boolean | undefined = undefined;
  private parsedData: ParsedMetadataExtension | undefined = undefined;

  public getType(): string {
    return "DDLX";
  }

  public getAllowedNaming() {
    return {
      maxLength: 40,
      allowNamespace: true,
    };
  }

  public hasParserError() {
    return this.parserError;
  }

  public parse(): IParseResult {
    if (this.isDirty() === false) {
      return {updated: false, runtime: 0};
    }

    const start = Date.now();

    this.parsedData = {
      tree: undefined,
    };

    this.parsedData.tree = new CDSParser().parse(this.findSourceFile());
    if (this.parsedData.tree === undefined) {
      this.parserError = true;
    }

    this.dirty = false;
    return {updated: true, runtime: Date.now() - start};
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }

  public findSourceFile() {
    return this.getFiles().find(f => f.getFilename().endsWith(".asddlxs") || f.getFilename().endsWith(".acds"));
  }
}
