export function getOrigin(req) {
  return `${req.protocol}://${req.headers.host}`;
}
