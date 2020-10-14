import * as Types from "../abap/types/basic";
import {AbstractObject} from "./_abstract_object";
import {xmlToArray} from "../xml_utils";
import {IRegistry} from "../_iregistry";
import {DDIC} from "../ddic";
import {IdentifierMeta, TypedIdentifier} from "../abap/types/_typed_identifier";

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

  public parseType(reg: IRegistry): TypedIdentifier {
    if (this.parsedData === undefined) {
      this.parseXML();
    }
    if (this.parsedData === undefined) {
      return TypedIdentifier.from(this.getIdentifier()!, new Types.UnknownType("View, parser error"));
    }

    const components: Types.IStructureComponent[] = [];
    const ddic = new DDIC(reg);
    for (const field of this.parsedData.fields) {
      if (field.VIEWFIELD === "*") {
        // ignore, this is a special case of old style .INCLUDE
        continue;
      }
      let found = ddic.lookupTableOrView(field.TABNAME);
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

    if (components.length === 0) {
      throw new Error("View " + this.getName() + " does not contain any components");
    }

    return TypedIdentifier.from(this.getIdentifier()!, new Types.StructureType(components), [IdentifierMeta.DDIC]);
  }

///////////////

  private parseXML() {
    const parsed = super.parseRaw();
    if (parsed === undefined) {
      return;
    }

    this.parsedData = {fields: []};

    const fields = parsed.abapGit["asx:abap"]["asx:values"]?.DD27P_TABLE;
    for (const field of xmlToArray(fields?.DD27P)) {
      this.parsedData.fields.push({
        VIEWFIELD: field.VIEWFIELD?._text,
        TABNAME: field.TABNAME?._text,
        FIELDNAME: field.FIELDNAME?._text,
      });
    }
  }

}
