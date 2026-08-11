import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { GRADES, URGENCY_LABEL } from '@/data/grades';
import { DISCLAIMER_TEXT } from '@/data/legal';
import { getLesion } from '@/data/lesions';
import { QUALITY_LABEL } from '@/services/quality';
import type { PatientProfile } from '@/store/settings';
import { severityScale } from '@/theme/tokens';
import type { ScanResult } from '@/types';
import { formatDateTime, formatPercent } from '@/utils/format';

const EYE_LABEL: Record<ScanResult['eye'], string> = {
  right: 'Œil droit (OD)',
  left: 'Œil gauche (OG)',
  unknown: 'Non précisé',
};

const DIABETES_LABEL: Record<PatientProfile['diabetesType'], string> = {
  type1: 'Diabète de type 1',
  type2: 'Diabète de type 2',
  gestationnel: 'Diabète gestationnel',
  aucun: 'Non renseigné',
};

/** Échappe le texte inséré dans le HTML du rapport. */
const escape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Lit l'image en base64 pour l'embarquer dans le PDF.
 *
 * On passe par l'API « legacy » d'expo-file-system : la nouvelle API restreint
 * les chemins accessibles et refuse la lecture des fichiers temporaires.
 */
async function embedImage(uri: string): Promise<string | null> {
  try {
    const FS = await import('expo-file-system/legacy');
    const base64 = await FS.readAsStringAsync(uri, { encoding: 'base64' });
    return `data:image/jpeg;base64,${base64}`;
  } catch {
    // Le rapport reste exploitable sans la vignette (image absente ou illisible).
    return null;
  }
}

function buildHtml(scan: ScanResult, profile: PatientProfile, imageData: string | null): string {
  const info = GRADES[scan.grade];
  const tone = severityScale[scan.grade];

  const findingsRows =
    scan.findings.length > 0
      ? scan.findings
          .map((finding) => {
            const lesion = getLesion(finding.id);
            return `<tr>
              <td><strong>${escape(finding.label)}</strong><div class="muted">${escape(
                lesion?.description ?? '',
              )}</div></td>
              <td class="num">${finding.count !== null ? finding.count : '—'}</td>
              <td class="num">${formatPercent(finding.confidence)}</td>
            </tr>`;
          })
          .join('')
      : `<tr><td colspan="3" class="muted">Aucun signe rétinien détecté sur cette image.</td></tr>`;

  const probabilities = scan.probabilities
    .map(
      (p, grade) => `<div class="prob">
        <span class="prob-label">${GRADES[grade as 0].code}</span>
        <span class="prob-bar"><i style="width:${(p * 100).toFixed(1)}%;background:${
          severityScale[grade as 0]
        }"></i></span>
        <span class="prob-value">${formatPercent(p, 1)}</span>
      </div>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8" />
<style>
  @page { margin: 32px 34px; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Helvetica Neue", Roboto, sans-serif; color: #101828; font-size: 12px; line-height: 1.5; }
  h1 { font-size: 21px; margin: 0; letter-spacing: -0.3px; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #667085; margin: 26px 0 10px; }
  .brand { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #101828; padding-bottom: 14px; }
  .brand-sub { color: #667085; font-size: 11px; margin-top: 3px; }
  .grid { display: flex; gap: 14px; }
  .card { border: 1px solid #E4E7EC; border-radius: 10px; padding: 14px; flex: 1; }
  .label { color: #667085; font-size: 10px; text-transform: uppercase; letter-spacing: 0.7px; }
  .value { font-size: 14px; font-weight: 700; margin-top: 3px; }
  .verdict { border-left: 5px solid ${tone}; background: #F9FAFB; border-radius: 10px; padding: 16px 18px; }
  .verdict .code { font-size: 30px; font-weight: 800; color: ${tone}; line-height: 1; }
  .verdict .name { font-size: 15px; font-weight: 700; margin-top: 6px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.7px; color: #667085; border-bottom: 1px solid #E4E7EC; padding: 7px 8px; }
  td { padding: 9px 8px; border-bottom: 1px solid #F2F4F7; vertical-align: top; }
  td.num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .muted { color: #667085; font-size: 10.5px; }
  .prob { display: flex; align-items: center; gap: 9px; margin-bottom: 5px; }
  .prob-label { width: 26px; font-weight: 700; font-size: 11px; }
  .prob-bar { flex: 1; height: 7px; background: #F2F4F7; border-radius: 4px; overflow: hidden; }
  .prob-bar i { display: block; height: 100%; }
  .prob-value { width: 52px; text-align: right; font-variant-numeric: tabular-nums; font-size: 11px; }
  .fundus { width: 168px; height: 168px; object-fit: cover; border-radius: 10px; border: 1px solid #E4E7EC; }
  ul { margin: 6px 0 0; padding-left: 17px; }
  li { margin-bottom: 4px; }
  .disclaimer { margin-top: 26px; border-top: 1px solid #E4E7EC; padding-top: 12px; color: #667085; font-size: 10px; }
</style></head>
<body>
  <div class="brand">
    <div>
      <h1>Rapport de dépistage rétinien</h1>
      <div class="brand-sub">RetinaScan · ${escape(scan.engine)}</div>
    </div>
    <div style="text-align:right">
      <div class="label">Édité le</div>
      <div class="value">${formatDateTime(Date.now())}</div>
    </div>
  </div>

  <h2>Examen</h2>
  <div class="grid">
    <div class="card"><div class="label">Personne</div><div class="value">${escape(
      profile.firstName || 'Non renseignée',
    )}</div><div class="muted">${DIABETES_LABEL[profile.diabetesType]}${
      profile.diagnosisYear ? ` · depuis ${escape(profile.diagnosisYear)}` : ''
    }</div></div>
    <div class="card"><div class="label">Œil analysé</div><div class="value">${
      EYE_LABEL[scan.eye]
    }</div><div class="muted">Capture du ${formatDateTime(scan.createdAt)}</div></div>
    <div class="card"><div class="label">Qualité image</div><div class="value">${
      QUALITY_LABEL[scan.quality.verdict]
    } · ${scan.quality.score}/100</div><div class="muted">Netteté ${
      scan.quality.metrics.nettete
    } · Éclairage ${scan.quality.metrics.eclairage}</div></div>
  </div>

  <h2>Conclusion de l'analyse</h2>
  <div class="grid">
    <div class="verdict" style="flex:2">
      <div class="code">${info.code}</div>
      <div class="name">${escape(info.label)}</div>
      <p style="margin:8px 0 0">${escape(info.summary)}</p>
      <p style="margin:10px 0 0"><strong>Confiance du modèle :</strong> ${formatPercent(
        scan.confidence,
      )}${scan.maculopathy ? ' · <strong>Œdème maculaire suspecté</strong>' : ''}</p>
    </div>
    ${imageData ? `<img class="fundus" src="${imageData}" alt="Fond d'œil" />` : ''}
  </div>

  <h2>Conduite à tenir</h2>
  <div class="card">
    <div class="value">${escape(URGENCY_LABEL[info.urgency])}</div>
    <p style="margin:6px 0 0">${escape(info.referral)} Recontrôle conseillé : <strong>${escape(
      info.followUp,
    )}</strong>.</p>
    <ul>${info.advice.map((a) => `<li>${escape(a)}</li>`).join('')}</ul>
  </div>

  <h2>Signes détectés</h2>
  <table>
    <thead><tr><th>Signe</th><th class="num">Lésions</th><th class="num">Confiance</th></tr></thead>
    <tbody>${findingsRows}</tbody>
  </table>

  <h2>Distribution des stades</h2>
  ${probabilities}

  ${
    scan.note
      ? `<h2>Note personnelle</h2><div class="card">${escape(scan.note)}</div>`
      : ''
  }

  <div class="disclaimer">${escape(DISCLAIMER_TEXT)}</div>
</body></html>`;
}

/**
 * Génère le rapport PDF du scan et ouvre la feuille de partage du système.
 * Renvoie `false` si le partage n'est pas disponible sur l'appareil.
 */
export async function exportScanReport(
  scan: ScanResult,
  profile: PatientProfile,
): Promise<boolean> {
  const imageData = await embedImage(scan.imageUri);
  // On demande le PDF en base64 : expo-print l'écrit sinon dans le cache
  // partagé d'Expo Go (hors bac à sable), que ni le système de fichiers ni le
  // partage ne peuvent lire. Avec le base64 en main, on réécrit le fichier
  // nous-mêmes dans le répertoire « documents », exposé au partage.
  const printed = await Print.printToFileAsync({
    html: buildHtml(scan, profile, imageData),
    base64: true,
  });

  if (!(await Sharing.isAvailableAsync())) return false;

  const FS = await import('expo-file-system/legacy');
  const date = new Date(scan.createdAt).toISOString().slice(0, 10);
  let target = printed.uri;

  if (printed.base64 && FS.documentDirectory) {
    const dir = `${FS.documentDirectory}reports/`;
    await FS.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
    target = `${dir}RetinaScan-${date}-${GRADES[scan.grade].code}.pdf`;
    await FS.writeAsStringAsync(target, printed.base64, { encoding: 'base64' });
  }

  await Sharing.shareAsync(target, {
    mimeType: 'application/pdf',
    dialogTitle: 'Partager le rapport RetinaScan',
    UTI: 'com.adobe.pdf',
  });
  return true;
}
