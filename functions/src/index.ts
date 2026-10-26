/**
 * AICTE SmartApproval Suite - Firebase Cloud Functions
 * Production API Handlers enforcing Section 9 & 11 of PRD v2.0
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// Helper: Verify authenticated context
function assertAuth(context: functions.https.CallableContext) {
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'The request does not have valid authentication credentials.');
  }
  return context.auth.uid;
}

// 9.1 getMyProfile
export const getMyProfile = functions.https.onCall(async (data, context) => {
  const uid = assertAuth(context);
  const snap = await db.collection('users').doc(uid).get();
  if (!snap.exists) {
    throw new functions.https.HttpsError('not-found', 'User profile not found');
  }
  const user = snap.data();
  if (!user?.active) {
    throw new functions.https.HttpsError('permission-denied', 'Account is deactivated');
  }
  return user;
});

// 9.1 adminCreateUser
export const adminCreateUser = functions.https.onCall(async (data, context) => {
  const uid = assertAuth(context);
  const callerSnap = await db.collection('users').doc(uid).get();
  if (callerSnap.data()?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only administrators can provision users');
  }

  const { email, displayName, role, institutionId } = data;
  const userRecord = await admin.auth().createUser({
    email,
    displayName
  });

  const profile = {
    uid: userRecord.uid,
    displayName,
    email,
    role,
    institutionId: institutionId || null,
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection('users').doc(userRecord.uid).set(profile);
  return profile;
});

// 9.2 submitApplication
export const submitApplication = functions.https.onCall(async (data, context) => {
  const uid = assertAuth(context);
  const { applicationId, expectedVersion } = data;

  return await db.runTransaction(async (transaction) => {
    const appRef = db.collection('applications').doc(applicationId);
    const appSnap = await transaction.get(appRef);

    if (!appSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Application does not exist');
    }

    const app = appSnap.data()!;
    if (app.createdBy !== uid) {
      throw new functions.https.HttpsError('permission-denied', 'Only the applicant institution can submit');
    }

    if (app.status !== 'draft' && app.status !== 'rectification') {
      throw new functions.https.HttpsError('failed-precondition', `Invalid status for submission: ${app.status}`);
    }

    if (app.version !== expectedVersion) {
      throw new functions.https.HttpsError('aborted', 'Concurrency conflict. Version mismatch.');
    }

    const toStatus = app.status === 'rectification' ? 're_scrutiny' : 'submitted';
    const toStage = app.status === 'rectification' ? 're_scrutiny' : 'scrutiny';

    transaction.update(appRef, {
      status: toStatus,
      currentStage: toStage,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      version: app.version + 1,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const wfRef = db.collection('workflowEvents').doc();
    transaction.set(wfRef, {
      applicationId,
      actorUid: uid,
      action: 'submitApplication',
      fromStatus: app.status,
      toStatus,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      correlationId: `corr_${Date.now()}`
    });

    return { applicationId, status: toStatus, currentStage: toStage };
  });
});
