import {UnknownType, VoidType} from "../abap/types/basic";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {DDIC} from "../ddic";
import {IObjectAndToken} from "../_iddic_references";
import {IRegistry} from "../_iregistry";
import {AbstractObject} from "./_abstract_object";

export class LockObject extends AbstractObject {
  private parsedXML: {
    primaryTable?: string,
    description?: string,
  } | undefined;

  public getType(): string {
    return "ENQU";
  }

  public getAllowedNaming() {
    return {
      maxLength: 16,
      allowNamespace: true,
    };
  }

  public setDirty(): void {
    this.parsedXML = undefined;
    super.setDirty();
  }

  public getPrimaryTable(): string | undefined {
    this.parse();
    return this.parsedXML?.primaryTable;
  }

  public parseType(reg: IRegistry): AbstractType {
    this.parse();

    const references: IObjectAndToken[] = [];
    const ddic = new DDIC(reg);

    if (this.parsedXML?.primaryTable) {
      const found = ddic.lookupTableOrView2(this.parsedXML.primaryTable);
      if (found) {
        references.push({object: found});
        reg.getDDICReferences().setUsing(this, references);
        return found.parseType(reg);
      } else if (ddic.inErrorNamespace(this.parsedXML.primaryTable)) {
        return new UnknownType(this.parsedXML.primaryTable + " not found");
      } else {
        return new VoidType(this.parsedXML.primaryTable);
      }
    } else {
      return new UnknownType("Parsing error");
    }
  }

  public parse() {
    if (this.parsedXML) {
      return {updated: false, runtime: 0};
    }

    const start = Date.now();
    this.parsedXML = {};
    const parsed = super.parseRaw2();

    if (parsed === undefined
        || parsed.abapGit === undefined
        || parsed.abapGit["asx:abap"]["asx:values"] === undefined) {
      return {updated: false, runtime: 0};
    }

    this.parsedXML.primaryTable = parsed.abapGit["asx:abap"]["asx:values"].DD25V?.ROOTTAB;
    this.parsedXML.description = parsed.abapGit["asx:abap"]["asx:values"].DD25V?.DDTEXT;

    const end = Date.now();
    return {updated: true, runtime: end - start};
  }

  public getDescription(): string | undefined {
    this.parse();
    return this.parsedXML?.description;
  }
}
