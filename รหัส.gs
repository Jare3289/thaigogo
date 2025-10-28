const FIREBASE_BASE_URL = 'https://thaievent-7784d-default-rtdb.firebaseio.com';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('ระบบจัดการคิวงานพระราชพิธีครู');
}

function getFirebaseSecret_() {
  return PropertiesService.getScriptProperties().getProperty('FIREBASE_DB_SECRET') || 'oDSyzXHcWvnjTGsvrDPrew6IlreT9KlBLqDpSDij';
}

function buildFirebaseUrl_(path) {
  const normalizedPath = path.replace(/^\/+/, '').replace(/\/+$/, '');
  return `${FIREBASE_BASE_URL.replace(/\/+$/, '')}/${normalizedPath}.json?auth=${getFirebaseSecret_()}`;
}

function firebaseRequest_(path, options) {
  const url = buildFirebaseUrl_(path);
  const params = {
    method: (options && options.method) || 'get',
    muteHttpExceptions: true,
    contentType: 'application/json',
  };

  if (options && options.payload !== undefined) {
    params.payload = options.payload;
  }

  const response = UrlFetchApp.fetch(url, params);
  const status = response.getResponseCode();
  const body = response.getContentText();

  if (status >= 400) {
    throw new Error(`Firebase request failed (${status}): ${body}`);
  }

  return body ? JSON.parse(body) : null;
}

function normalizeFirebaseList_(value) {
  if (Array.isArray(value)) {
    return value.filter(item => item !== null);
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .map(key => value[key]);
  }

  return [];
}

function fetchInitialData() {
  return {
    config: firebaseRequest_('config') || {},
    teachers: normalizeFirebaseList_(firebaseRequest_('teachers')),
    events: normalizeFirebaseList_(firebaseRequest_('events')),
    activityLog: normalizeFirebaseList_(firebaseRequest_('activityLog')),
  };
}

function saveAllData(payload) {
  if (!payload) {
    throw new Error('Payload is required');
  }

  if (payload.config !== undefined) {
    firebaseRequest_('config', {
      method: 'put',
      payload: JSON.stringify(payload.config),
    });
  }

  if (payload.teachers !== undefined) {
    firebaseRequest_('teachers', {
      method: 'put',
      payload: JSON.stringify(payload.teachers),
    });
  }

  if (payload.events !== undefined) {
    firebaseRequest_('events', {
      method: 'put',
      payload: JSON.stringify(payload.events),
    });
  }

  if (payload.activityLog !== undefined) {
    firebaseRequest_('activityLog', {
      method: 'put',
      payload: JSON.stringify(payload.activityLog),
    });
  }

  return { success: true };
}
