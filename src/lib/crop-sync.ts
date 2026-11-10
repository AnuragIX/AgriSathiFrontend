import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "./firebase";
import type { CropLogEntry } from "./agri-data";

/**
 * Loads all crop logs for the authenticated user from Firestore.
 */
export async function loadCloudCropLogs(userId: string): Promise<CropLogEntry[]> {
  const collectionPath = `users/${userId}/cropLogs`;
  try {
    const snap = await getDocs(collection(db, collectionPath));
    const list: CropLogEntry[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as CropLogEntry);
    });
    // Sort newest first
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, collectionPath);
    return [];
  }
}

/**
 * Persists a new or updated crop log entry to Firestore.
 */
export async function saveCloudCropLog(userId: string, entry: CropLogEntry): Promise<void> {
  const safeId = entry.id.replace(/[^a-zA-Z0-9_-]/g, "_");
  const docPath = `users/${userId}/cropLogs/${safeId}`;
  try {
    const payload: Record<string, unknown> = {
      id: safeId,
      userId,
      crop: entry.crop,
      disease: entry.disease,
      pathogen: entry.pathogen,
      confidence: Number(entry.confidence),
      status: entry.status,
      createdAt: entry.createdAt,
    };
    if (entry.healthy !== undefined) {
      payload.healthy = Boolean(entry.healthy);
    }
    if (entry.imageUrl && !entry.imageUrl.startsWith("blob:") && entry.imageUrl.length < 500000) {
      payload.imageUrl = entry.imageUrl;
    }
    await setDoc(doc(db, docPath), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

/**
 * Updates the recovery status of a crop log entry in Firestore.
 */
export async function updateCloudCropLogStatus(
  userId: string,
  logId: string,
  status: CropLogEntry["status"],
): Promise<void> {
  const safeId = logId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const docPath = `users/${userId}/cropLogs/${safeId}`;
  try {
    await updateDoc(doc(db, docPath), { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, docPath);
  }
}

/**
 * Deletes a crop log entry from Firestore.
 */
export async function deleteCloudCropLog(userId: string, logId: string): Promise<void> {
  const safeId = logId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const docPath = `users/${userId}/cropLogs/${safeId}`;
  try {
    await deleteDoc(doc(db, docPath));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, docPath);
  }
}

/**
 * Saves user profile and preferred language to Firestore.
 */
export async function syncUserProfile(
  userId: string,
  displayName: string | null,
  preferredLanguage: string,
): Promise<void> {
  const docPath = `users/${userId}`;
  try {
    await setDoc(
      doc(db, docPath),
      {
        userId,
        displayName: displayName || "Assam Farmer",
        preferredLanguage,
        location: "Rangia, Kamrup",
        createdAt: new Date().toISOString(),
      },
      { merge: true },
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

/**
 * Synchronizes local device logs with Firestore cloud logs:
 * - Fetches cloud logs
 * - Uploads any local logs that are missing from cloud
 * - Merges and returns deduplicated list sorted by timestamp
 */
export async function syncLocalAndCloudLogs(
  userId: string,
  localLogs: CropLogEntry[],
): Promise<CropLogEntry[]> {
  try {
    const cloudLogs = await loadCloudCropLogs(userId);
    const cloudMap = new Map<string, CropLogEntry>();
    for (const c of cloudLogs) {
      cloudMap.set(c.id, c);
    }

    // Push local entries that aren't yet in Firestore
    for (const local of localLogs) {
      const safeId = local.id.replace(/[^a-zA-Z0-9_-]/g, "_");
      if (!cloudMap.has(safeId)) {
        await saveCloudCropLog(userId, { ...local, id: safeId });
        cloudMap.set(safeId, { ...local, id: safeId });
      }
    }

    return Array.from(cloudMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (err) {
    console.warn("Could not complete cloud log sync:", err);
    return localLogs;
  }
}
