const crypto = require('crypto');
const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
function validToken(req) {
    const supplied = req.get('x-csrf-token') || req.body?._csrf;
    const expected = req.session?.csrfToken;
    return typeof supplied === 'string' && /^[a-f0-9]{64}$/.test(supplied) && typeof expected === 'string' && supplied.length === expected.length && crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}
function sameOrigin(req) {
    if (req.get('sec-fetch-site') === 'cross-site') return false;
    const origin = req.get('origin');
    if (!origin) return true; // token remains mandatory
    try { return new URL(origin).host === req.get('host'); } catch { return false; }
}
function deny(res) { return res.status(403).send('Solicitud no válida. Recarga la página y vuelve a intentar.'); }
function csrf(req, res, next) {
    if (!req.session.csrfToken) req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    res.locals.csrfToken = req.session.csrfToken;
    res.setHeader('Cache-Control', 'no-store');
    if (safeMethods.has(req.method)) return next();
    if (!sameOrigin(req)) return deny(res);
    // Multipart token is validated by the upload middleware before its controller runs.
    if (req.is('multipart/form-data')) return next();
    if (!validToken(req)) return deny(res);
    req.csrfValidated = true;
    delete req.body?._csrf;
    next();
}
function csrfApi(req, res, next) {
    if (!sameOrigin(req) || !validToken(req)) return deny(res);
    next();
}
function protectAction(action) {
    return (req, res, next) => {
        if (!safeMethods.has(req.method) && !req.csrfValidated) return deny(res);
        return action(req, res, next);
    };
}
const attempts = new Map();
const cleanup = setInterval(() => { const now=Date.now(); for (const [key,value] of attempts) if(value.reset<=now) attempts.delete(key); },60000);cleanup.unref();
function loginLimit(req,res,next) {
    const now=Date.now(); const user=typeof req.body.username==='string'?req.body.username.trim().toLowerCase():'';
    const keys=[['ip:'+req.ip,30],['account:'+user,10]];
    for(const [key,max] of keys){let record=attempts.get(key);if(!record||record.reset<=now){record={count:0,reset:now+15*60000};attempts.set(key,record);}if(record.count>=max){res.setHeader('Retry-After',Math.ceil((record.reset-now)/1000));return res.status(429).send('Demasiados intentos de acceso. Intenta más tarde.');}}
    for(const [key] of keys)attempts.get(key).count++;
    next();
}
module.exports={csrf,csrfApi,validToken,sameOrigin,loginLimit,protectAction};
