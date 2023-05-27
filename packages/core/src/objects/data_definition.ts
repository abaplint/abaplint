import {ExpressionNode} from "../abap/nodes";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {CDSDetermineTypes} from "../cds/cds_determine_types";
import {CDSParser} from "../cds/cds_parser";
import {CDSAnnotation, CDSAs, CDSAssociation, CDSElement, CDSName, CDSRelation, CDSSelect, CDSSource} from "../cds/expressions";
import {IRegistry} from "../_iregistry";
import {AbstractObject} from "./_abstract_object";
import {IParseResult} from "./_iobject";

export type ParsedDataDefinition = {
  sqlViewName: string | undefined;
  definitionName: string | undefined;
  fields: {key: boolean, name: string, annotations: string[]}[];
  sources: {name: string, as: string | undefined}[];
  associations: {name: string, as: string | undefined}[],
  relations: {name: string, as: string | undefined}[];
  tree: ExpressionNode | undefined;
};

export class DataDefinition extends AbstractObject {
  private parserError: boolean | undefined = undefined;
  private parsedData: ParsedDataDefinition | undefined = undefined;

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
    this.parse();
    return this.parsedData?.sqlViewName;
  }

  public getDefinitionName(): string | undefined {
    this.parse();
    return this.parsedData?.definitionName;
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }

  public parseType(reg: IRegistry): AbstractType {
    this.parse();
    return new CDSDetermineTypes().parseType(reg, this.parsedData!);
  }

  public getParsedData() {
    return this.parsedData;
  }

  public listSources() {
    this.parse();
    return this.parsedData?.sources;
  }

  public setDirty(): void {
    this.parsedData = undefined;
    this.parserError = undefined;
    super.setDirty();
  }

  public findSourceFile() {
    return this.getFiles().find(f => f.getFilename().endsWith(".asddls") || f.getFilename().endsWith(".acds"));
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
      sqlViewName: undefined,
      definitionName: undefined,
      fields: [],
      sources: [],
      relations: [],
      associations: [],
      tree: undefined,
    };

    this.findSQLViewName();

    this.parsedData.tree = new CDSParser().parse(this.findSourceFile());
    if (this.parsedData.tree) {
      for (const c of this.parsedData.tree?.getChildren() || []) {
        if (c.get() instanceof CDSAnnotation) {
          continue;
        }
        if (c instanceof ExpressionNode) {
          this.parsedData.definitionName = c.findFirstExpression(CDSName)?.concatTokens().replace(/ /g, "");
          break;
        }
      }
      this.findSourcesAndRelations(this.parsedData.tree);
      this.findFieldNames(this.parsedData.tree);
    } else {
      this.parserError = true;
    }

    this.dirty = false;
    return {updated: true, runtime: Date.now() - start};
  }

  public getTree() {
    return this.parsedData?.tree;
  }

//////////

  private findSQLViewName(): void {
    const match = this.findSourceFile()?.getRaw().match(/@AbapCatalog\.sqlViewName: '(\w+)'/);
    if (match) {
      this.parsedData!.sqlViewName = match[1].toUpperCase();
    }
  }

  private findFieldNames(tree: ExpressionNode) {
    const select = tree.findFirstExpression(CDSSelect);
    for (const e of select?.findDirectExpressions(CDSElement) || []) {
      let found = e.findDirectExpression(CDSAs)?.findDirectExpression(CDSName);
      if (found === undefined) {
        const list = e.findDirectExpressions(CDSName);
        if (e.concatTokens().toUpperCase().includes(" REDIRECTED TO ")) {
          found = list[0];
        } else {
          found = list[list.length - 1];
        }
      }
      if (found === undefined) {
        continue;
      }
      const name = found?.concatTokens();
      if (this.parsedData?.associations.some(a =>
        a.name.toUpperCase() === name.toUpperCase() || a.as?.toUpperCase() === name.toUpperCase())) {
        continue;
      }

      const annotations: string[] = [];
      for (const a of e.findDirectExpressions(CDSAnnotation)) {
        annotations.push(a.concatTokens());
      }

      this.parsedData!.fields.push({
        name: name,
        annotations: annotations,
        key: e.findDirectTokenByText("KEY") !== undefined,
      });
    }
  }

  private findSourcesAndRelations(tree: ExpressionNode) {
    for (const e of tree.findAllExpressions(CDSSource)) {
      const name = e.getFirstToken().getStr();
      const as = e.findDirectExpression(CDSAs)?.findDirectExpression(CDSName)?.getFirstToken().getStr();
      this.parsedData!.sources.push({name, as});
    }

    for (const e of tree.findAllExpressions(CDSRelation)) {
      const name = e.getFirstToken().getStr();
      const as = e.findDirectExpression(CDSAs)?.findDirectExpression(CDSName)?.getFirstToken().getStr();
      this.parsedData!.relations.push({name, as});
    }

    for (const e of tree.findAllExpressions(CDSAssociation)) {
      const j = e.findDirectExpression(CDSRelation);
      if (j === undefined) {
        continue;
      }
      const name = j.getFirstToken().getStr();
      const as = j.findDirectExpression(CDSAs)?.findDirectExpression(CDSName)?.getFirstToken().getStr();
      this.parsedData!.associations.push({
        name: name || "ERROR",
        as: as,
      });
    }
  }
}
