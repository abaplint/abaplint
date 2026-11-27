import {Visibility} from "../4_file_information/visibility";
import {IdentifierMeta, TypedIdentifier} from "./_typed_identifier";

export class ClassAttribute extends TypedIdentifier {
  private readonly visibility: Visibility;
  private readonly readOnly: boolean;

  public constructor(id: TypedIdentifier, visibility: Visibility, meta: readonly IdentifierMeta[],
                     value?: string | {[index: string]: string}, readOnly = false) {
    super(id.getToken(), id.getFilename(), id.getType(), meta, value);
    this.visibility = visibility;
    this.readOnly = readOnly;
  }

  public getVisibility() {
    return this.visibility;
  }

  public isReadOnly(): boolean {
    return this.readOnly;
  }
}
