import {Issue} from "../issue";
import {IFile} from "../files/_ifile";
import {DynproField, DynproHeader} from "../objects/_dynpros";
import {IObject} from "../objects/_iobject";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {FunctionGroup, Program} from "../objects";
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
      extendedInformation: `* Check length of PUSH elements less than 132
* Check for overlapping screen elements
* Check that each screen has flow logic, either inline in the XML or in a separate screen file, eg. zfoo.prog.screen_0100.abap
* Check that each screen file has a matching screen in the XML
* Check that each tabstrip tab title has a subscreen area of the tabstrip assigned`,
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

    if (!(obj instanceof Program) && !(obj instanceof FunctionGroup)) {
      return [];
    }

    const file = obj.getXMLFile();
    if (file === undefined) {
      return [];
    }

    const dynpros = obj.getDynpros();
    for (const dynpro of dynpros) {
      for (const field of dynpro.fields) {
        if (field.type === "PUSH" && field.length > 132) {
          const message = `Screen ${dynpro.number}, field ${field.name} LENGTH longer than 132`;
          ret.push(Issue.atPosition(file, new Position(1, 1), message, this.getMetadata().key, this.getConfig().severity));
        }
      }

      ret.push(...this.findOverlappingFields(dynpro, file));
      ret.push(...this.checkTabstripSubscreens(dynpro, file));
    }

    ret.push(...this.checkFlowLogic(obj, dynpros, file));

    return ret;
  }

  private checkFlowLogic(obj: Program | FunctionGroup, dynpros: readonly DynproHeader[], file: IFile): Issue[] {
    const ret: Issue[] = [];
    const type = obj.getType().toLowerCase();
    const pattern = new RegExp("\\." + type + "\\.screen_(\\d+)\\.abap$", "i");

    const screenFiles = new Map<string, IFile>();
    for (const f of obj.getFiles()) {
      const match = f.getFilename().match(pattern);
      if (match) {
        screenFiles.set(this.padNumber(match[1]), f);
      }
    }

    const numbers = new Set<string>();
    for (const dynpro of dynpros) {
      const number = this.padNumber(dynpro.number);
      numbers.add(number);
      if (dynpro.hasFlowLogic === true || screenFiles.has(number)) {
        continue;
      }
      const expected = obj.getName().toLowerCase().replace(/\//g, "#") + "." + type + ".screen_" + number + ".abap";
      const message = `Screen ${number}, flow logic missing, expected file ${expected}`;
      ret.push(Issue.atPosition(file, new Position(1, 1), message, this.getMetadata().key, this.getConfig().severity));
    }

    for (const [number, screenFile] of screenFiles) {
      if (numbers.has(number) === false) {
        const message = `Screen file ${screenFile.getFilename()} has no dynpro ${number} in the XML`;
        ret.push(Issue.atPosition(screenFile, new Position(1, 1), message, this.getMetadata().key, this.getConfig().severity));
      }
    }

    return ret;
  }

  private padNumber(value: string | undefined): string {
    return (value ?? "").toString().trim().padStart(4, "0");
  }

  // each tab title (PUSH in a STRIP_CTRL) must reference a SUBSCREEN area of the same tabstrip via REF_FIELD,
  // several tabs may share one subscreen area
  private checkTabstripSubscreens(dynpro: DynproHeader, file: IFile): Issue[] {
    const ret: Issue[] = [];

    for (const field of dynpro.fields) {
      if (field.type !== "PUSH" || field.contType !== "STRIP_CTRL") {
        continue;
      }

      let message: string | undefined = undefined;
      if (field.refField === undefined) {
        message = `Screen ${dynpro.number}, no subscreen is assigned to tabstrip pushbutton ${field.name}`;
      } else {
        const ref = field.refField.toUpperCase();
        const area = dynpro.containers.find(c => c.type === "SUBSCREEN"
          && c.name?.toUpperCase() === ref
          && (field.contName === undefined || c.elementOf?.toUpperCase() === field.contName.toUpperCase()));
        if (area === undefined) {
          message = `Screen ${dynpro.number}, tabstrip pushbutton ${field.name} references ${field.refField}, ` +
            `which is not a subscreen area of tabstrip ${field.contName}`;
        }
      }

      if (message !== undefined) {
        ret.push(Issue.atPosition(file, new Position(1, 1), message, this.getMetadata().key, this.getConfig().severity));
      }
    }

    return ret;
  }

  private findOverlappingFields(dynpro: DynproHeader, file: IFile): Issue[] {
    const ret: Issue[] = [];

    for (let index = 0; index < dynpro.fields.length; index++) {
      const current = dynpro.fields[index];
      if (current.name === undefined || current.type === "FRAME" || this.hasContainerRelativeCoordinates(current)) {
        continue;
      }

      for (let compare = index + 1; compare < dynpro.fields.length; compare++) {
        const other = dynpro.fields[compare];
        if (other.name === undefined || other.type === "FRAME" || this.hasContainerRelativeCoordinates(other)
          || this.overlaps(current, other) === false) {
          continue;
        }

        const message = `Screen ${dynpro.number}, ${current.type} ${current.name} and ${other.type} ${other.name} are overlapping`;
        ret.push(Issue.atPosition(file, new Position(1, 1), message, this.getMetadata().key, this.getConfig().severity));
      }
    }

    return ret;
  }

  private hasContainerRelativeCoordinates(field: DynproField): boolean {
    return field.contType === "TABLE_CTRL" || field.contType === "LOOP" || field.contType === "STRIP_CTRL";
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
