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
      ROLLNAME: string,
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
      components.push({
        name: field.VIEWFIELD,
        type: ddic.lookupDataElement(field.ROLLNAME)});
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
        ROLLNAME: field.ROLLNAME?._text,
        FIELDNAME: field.FIELDNAME?._text,
      });
    }
  }

}
