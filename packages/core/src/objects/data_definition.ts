import {ExpressionNode} from "../abap/nodes";
import {IStructureComponent, StructureType, VoidType} from "../abap/types/basic";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {CDSParser} from "../cds/cds_parser";
import {CDSAs, CDSElement, CDSName, CDSSource} from "../cds/expressions";
import {IRegistry} from "../_iregistry";
import {AbstractObject} from "./_abstract_object";
import {IParseResult} from "./_iobject";

export class DataDefinition extends AbstractObject {
  private sqlViewName: string | undefined = undefined;
  private parserError: boolean |undefined = undefined;
  private fieldNames: string[] = [];
  private sources: {name: string, as: string | undefined}[] = [];

  public getType(): string {
    return "DDLS";
  }

  public getAllowedNaming() {
    return {
      maxLength: 40,
      allowNamespace: true,
    };
  }

  public getSQLViewName(): string | undefined {
    return this.sqlViewName;
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }

  public parseType(_reg: IRegistry): AbstractType {
    this.parse();

    if (this.fieldNames.length === 0) {
      return new VoidType("DDLS:todo");
    } else {
      const components: IStructureComponent[] = [];
      for (const f of this.fieldNames) {
        components.push({
          name: f,
          type: new VoidType("DDLS:fieldname"),
        });
      }
      return new StructureType(components);
    }
  }

  public listSources() {
    return this.sources;
  }

  public setDirty(): void {
    this.sqlViewName = undefined;
    this.parserError = undefined;
    this.fieldNames = [];
    this.sources = [];
    super.setDirty();
  }

  public findSourceFile() {
    return this.getFiles().find(f => f.getFilename().endsWith(".asddls"));
  }

  public hasParserError() {
    return this.parserError;
  }

  public parse(): IParseResult {
    if (this.isDirty() === false) {
      return {updated: false, runtime: 0};
    }

    this.sqlViewName = undefined;
    const match = this.findSourceFile()?.getRaw().match(/@AbapCatalog\.sqlViewName: '(\w+)'/);
    if (match) {
      this.sqlViewName = match[1].toUpperCase();
    }

    const tree = new CDSParser().parse(this.findSourceFile());
    if (tree) {
      this.findFieldNames(tree);
      this.findSources(tree);
    } else {
      this.parserError = true;
    }

    this.dirty = false;
    return {updated: true, runtime: 0};
  }

  private findFieldNames(tree: ExpressionNode) {
    this.fieldNames = [];
    for (const e of tree.findAllExpressions(CDSElement)) {
      let found = e.findDirectExpression(CDSAs)?.findDirectExpression(CDSName);
      if (found === undefined) {
        found = e.findDirectExpression(CDSName);
      }
      if (found === undefined) {
        continue;
      }
      this.fieldNames.push(found?.concatTokens());
    }
  }

  private findSources(tree: ExpressionNode) {
    this.sources = [];
    for (const e of tree.findAllExpressions(CDSSource)) {
      const name = e.getFirstToken().getStr();
      const as = e.findDirectExpression(CDSAs)?.findDirectExpression(CDSName)?.getFirstToken().getStr();
      this.sources.push({name, as});
    }
  }
}
