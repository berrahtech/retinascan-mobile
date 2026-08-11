import { Directory, File, Paths } from 'expo-file-system';

/**
 * Stockage persistant des images de scan.
 *
 * L'appareil photo et le sélecteur écrivent leurs images dans le cache de
 * l'application, que le système d'exploitation purge quand il manque d'espace.
 * Un scan enregistré perdait donc sa photo (vignette vide, image noire, absente
 * du PDF). On recopie l'image dans le répertoire « documents », à l'abri de ces
 * purges, et on référence cette copie.
 */

const FOLDER = 'scans';

const scansDir = () => new Directory(Paths.document, FOLDER);

/**
 * Copie l'image d'un scan dans le stockage persistant et renvoie son nouvel URI.
 * En cas d'échec, renvoie l'URI d'origine : mieux vaut une image éphémère que
 * pas d'image du tout.
 */
export async function persistScanImage(sourceUri: string, scanId: string): Promise<string> {
  try {
    const dir = scansDir();
    if (!dir.exists) dir.create({ intermediates: true });

    const dest = new File(dir, `${scanId}.jpg`);
    if (dest.exists) dest.delete();

    await new File(sourceUri).copy(dest);
    return dest.uri;
  } catch {
    return sourceUri;
  }
}

/** Supprime l'image persistée d'un scan. Sans effet si elle n'existe pas. */
export function deleteScanImage(scanId: string): void {
  try {
    const file = new File(scansDir(), `${scanId}.jpg`);
    if (file.exists) file.delete();
  } catch {
    // Le nettoyage du fichier ne doit jamais bloquer la suppression du scan.
  }
}
