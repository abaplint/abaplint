import {AbstractObject} from "./_abstract_object";

export class MaintenanceAndTransportObject extends AbstractObject {
  private parsedXML: {
    area?: string,
    objectName?: string,
    objectType?: string,
  } | undefined;

  public setDirty() {
    super.setDirty();
    this.parsedXML = undefined;
  }

  public getType(): string {
    return "TOBJ";
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }

  public getAllowedNaming() {
    return {
      maxLength: 31,
      allowNamespace: true,
    };
  }

  public getArea(): string | undefined {
    this.parse();
    return this.parsedXML?.area;
  }

  public getObjectName(): string | undefined {
    this.parse();
    return this.parsedXML?.objectName;
  }

  public getObjectType(): string | undefined {
    this.parse();
    return this.parsedXML?.objectType;
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

    this.parsedXML.area = parsed.abapGit["asx:abap"]["asx:values"].TOBJ?.TVDIR?.AREA;
    this.parsedXML.objectName = parsed.abapGit["asx:abap"]["asx:values"].OBJH?.OBJECTNAME;
    this.parsedXML.objectType = parsed.abapGit["asx:abap"]["asx:values"].OBJH?.OBJECTTYPE;

    const end = Date.now();
    return {updated: true, runtime: end - start};
  }

}
