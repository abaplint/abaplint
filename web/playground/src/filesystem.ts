export interface IFile {
  filename: string;
  contents: string;
}

export interface IFileSubscriber {
  notify(): void;
}

/*
events:
add
delete
update
rename
*/

export class FileSystem {
  private static files: IFile[] = [];
  private static subscribers: IFileSubscriber[] = [];

  public static addFile(filename: string, contents: string) {
    this.files.push({filename, contents});
    this.notify();
  }

  public static getFiles(): IFile[] {
    return this.files;
  }

  public static register(obj: IFileSubscriber) {
    this.subscribers.push(obj);
  }

  private static notify() {
    for (const s of this.subscribers) {
      s.notify();
    }
  }

}