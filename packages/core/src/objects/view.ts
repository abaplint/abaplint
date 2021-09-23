import * as Types from "../abap/types/basic";
import {AbstractObject} from "./_abstract_object";
import {xmlToArray} from "../xml_utils";
import {IRegistry} from "../_iregistry";
import {DDIC} from "../ddic";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {IObject} from "./_iobject";

export class View extends AbstractObject {
  private parsedData: {
    fields: {
      VIEWFIELD: string,
      TABNAME: string,
      FIELDNAME: string}[]} | undefined;

  public getType(): string {
    return "VIEW";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public setDirty(): void {
    this.parsedData = undefined;
    super.setDirty();
  }

  public parseType(reg: IRegistry): AbstractType {
    if (this.parsedData === undefined) {
      this.parseXML();
    }
    if (this.parsedData === undefined) {
      return new Types.UnknownType("View, parser error", this.getName());
    }

    const components: Types.IStructureComponent[] = [];
    const references: IObject[] = [];
    const ddic = new DDIC(reg);
    for (const field of this.parsedData.fields) {
      if (field.VIEWFIELD === "*" || field.VIEWFIELD === "-") {
        // ignore, this is a special case of old style .INCLUDE
        continue;
      }
      const lookup = ddic.lookupTableOrView(field.TABNAME);
      if (lookup.object) {
        references.push(lookup.object);
      }
      let found = lookup.type;
      if (found instanceof TypedIdentifier) {
        found = found.getType();
      }
      if (found instanceof Types.StructureType) {
        const s = found.getComponentByName(field.FIELDNAME);
        if (s === undefined) {
          found = new Types.UnknownType(field.FIELDNAME + " not found in " + field.TABNAME + ", VIEW parse type");
        } else {
          found = s;
        }
      }
      components.push({
        name: field.VIEWFIELD,
        type: found});
    }

    reg.getDDICReferences().setUsing(this, references);
    if (components.length === 0) {
      return new Types.UnknownType("View " + this.getName() + " does not contain any components");
    }

    return new Types.StructureType(components, this.getName());
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }

///////////////

  private parseXML() {
    this.parsedData = {fields: []};

    const parsed = super.parseRaw2();
    if (parsed === undefined || parsed.abapGit === undefined) {
      return;
    }

    const fields = parsed.abapGit["asx:abap"]["asx:values"]?.DD27P_TABLE;
    for (const field of xmlToArray(fields?.DD27P)) {
      this.parsedData.fields.push({
        VIEWFIELD: field.VIEWFIELD,
        TABNAME: field.TABNAME,
        FIELDNAME: field.FIELDNAME,
      });
    }
  }

}
