import {Issue} from "../issue";
import {IFile} from "../files/_ifile";
import {DynproField, DynproHeader} from "../objects/_dynpros";
import {IObject} from "../objects/_iobject";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {Program} from "../objects";
import {Position} from "../position";

export class DynproChecksConf extends BasicRuleConfig {
}

export class DynproChecks implements IRule {
  private conf = new DynproChecksConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "dynpro_checks",
      title: "Dynpro Checks",
      shortDescription: `Various Dynpro checks`,
      extendedInformation: `* Check length of PUSH elements less than 132\n* Check for overlapping screen elements`,
      tags: [RuleTag.Syntax],
    };
  }

  public initialize(_reg: IRegistry) {
    return this;
  }

  public getConfig(): DynproChecksConf {
    return this.conf;
  }

  public setConfig(conf: DynproChecksConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    const ret: Issue[] = [];

    if (!(obj instanceof Program)) {
      return [];
    }

    const file = obj.getXMLFile();
    if (file === undefined) {
      return [];
    }

    for (const dynpro of obj.getDynpros()) {
      for (const field of dynpro.fields) {
        if (field.type === "PUSH" && field.length > 132) {
          const message = `Screen ${dynpro.number}, field ${field.name} LENGTH longer than 132`;
          ret.push(Issue.atPosition(file, new Position(1, 1), message, this.getMetadata().key, this.getConfig().severity));
        }
      }

      ret.push(...this.findOverlappingFields(dynpro, file));
    }

    return ret;
  }

  private findOverlappingFields(dynpro: DynproHeader, file: IFile): Issue[] {
    const ret: Issue[] = [];

    for (let index = 0; index < dynpro.fields.length; index++) {
      const current = dynpro.fields[index];
      if (current.name === undefined || current.type === "FRAME") {
        continue;
      }

      for (let compare = index + 1; compare < dynpro.fields.length; compare++) {
        const other = dynpro.fields[compare];
        if (other.name === undefined || other.type === "FRAME" || this.overlaps(current, other) === false) {
          continue;
        }

        const message = `Screen ${dynpro.number}, ${current.type} ${current.name} and ${other.type} ${other.name} are overlapping`;
        ret.push(Issue.atPosition(file, new Position(1, 1), message, this.getMetadata().key, this.getConfig().severity));
      }
    }

    return ret;
  }

  private overlaps(first: DynproField, second: DynproField): boolean {
    if (first.line === 0 || second.line === 0 || first.column === 0 || second.column === 0) {
      return false;
    }

    const firstHeight = Math.max(first.height, 1);
    const secondHeight = Math.max(second.height, 1);
    const firstLastLine = first.line + firstHeight - 1;
    const secondLastLine = second.line + secondHeight - 1;
    if (firstLastLine < second.line || secondLastLine < first.line) {
      return false;
    }

    const firstLastColumn = first.column + Math.max(first.vislength || first.length, 1) - 1;
    const secondLastColumn = second.column + Math.max(second.vislength || second.length, 1) - 1;
    return first.column <= secondLastColumn && second.column <= firstLastColumn;
  }

}
