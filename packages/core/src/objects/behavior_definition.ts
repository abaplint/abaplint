import {ExpressionNode} from "../abap/nodes";
import {BDEFParser} from "../bdef/bdef_parser";
import {BDEFAlias, BDEFDefineBehavior, BDEFName} from "../bdef/expressions";
import {AbstractObject} from "./_abstract_object";
import {IParseResult} from "./_iobject";

export type ParsedBehaviorDefinition = {
  /** entities defined in the behavior definition, alias is undefined if not specified */
  entities: {name: string, alias: string | undefined}[];
  tree: ExpressionNode | undefined;
};

export class BehaviorDefinition extends AbstractObject {
  private parsedData: ParsedBehaviorDefinition | undefined = undefined;

  public getType(): string {
    return "BDEF";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public setDirty(): void {
    this.parsedData = undefined;
    super.setDirty();
  }

  public findSourceFile() {
    return this.getFiles().find(f => f.getFilename().endsWith(".asbdef"));
  }

  public parse(): IParseResult {
    if (this.isDirty() === false && this.parsedData !== undefined) {
      return {updated: false, runtime: 0};
    }

    const start = Date.now();
    const tree = new BDEFParser().parse(this.findSourceFile());
    this.parsedData = {
      entities: tree ? this.findEntities(tree) : this.findEntitiesFallback(),
      tree,
    };

    this.dirty = false;
    return {updated: true, runtime: Date.now() - start};
  }

  public getTree(): ExpressionNode | undefined {
    this.parse();
    return this.parsedData?.tree;
  }

  public hasParserError(): boolean {
    return this.findSourceFile() !== undefined && this.getTree() === undefined;
  }

  public listEntities(): readonly {name: string, alias: string | undefined}[] {
    this.parse();
    return this.parsedData!.entities;
  }

  /** finds the entity name for a given alias, undefined if the alias is not defined */
  public findEntityNameByAlias(alias: string): string | undefined {
    const upper = alias.toUpperCase();
    for (const entity of this.listEntities()) {
      if (entity.alias?.toUpperCase() === upper) {
        return entity.name;
      }
    }
    return undefined;
  }

/////////////////////////

  private findEntities(tree: ExpressionNode): ParsedBehaviorDefinition["entities"] {
    const ret: ParsedBehaviorDefinition["entities"] = [];
    for (const define of tree.findDirectExpressions(BDEFDefineBehavior)) {
      const name = define.findDirectExpression(BDEFName);
      if (name === undefined) {
        continue;
      }
      const alias = define.findDirectExpression(BDEFAlias)?.findDirectExpression(BDEFName);
      ret.push({
        name: name.concatTokens().replace(/ /g, ""),
        alias: alias?.concatTokens().replace(/ /g, ""),
      });
    }
    return ret;
  }

  /** used if the source cannot be parsed */
  private findEntitiesFallback(): ParsedBehaviorDefinition["entities"] {
    const ret: ParsedBehaviorDefinition["entities"] = [];

    const raw = this.findSourceFile()?.getRaw();
    if (raw === undefined) {
      return ret;
    }

    // BDEF uses "//" for line comments
    const stripped = raw.replace(/\/\/.*$/gm, "");
    // eg. "define behavior for ZI_Booking alias Booking", also "define abstract behavior for ..."
    const regex = /\bdefine\s+(?:\w+\s+)*?behavior\s+for\s+([\w/]+)(?:\s+alias\s+(\w+))?/gi;
    let match = regex.exec(stripped);
    while (match !== null) {
      ret.push({name: match[1], alias: match[2]});
      match = regex.exec(stripped);
    }

    return ret;
  }
}
