let clientPromise = null;

export function getClient() {
  if (!clientPromise) {
    clientPromise = window.app.initialized();
  }
  return clientPromise;
}