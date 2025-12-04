import {r as e, j as t, au as r} from "./vendor_react-C5pC1lDO.js";
function n(e, t) {
    for (var r = 0; r < t.length; r++) {
        const n = t[r];
        if ("string" != typeof n && !Array.isArray(n))
            for (const t in n)
                if ("default" !== t && !(t in e)) {
                    const r = Object.getOwnPropertyDescriptor(n, t);
                    r && Object.defineProperty(e, t, r.get ? r : {
                        enumerable: !0,
                        get: () => n[t]
                    })
                }
    }
    return Object.freeze(Object.defineProperty(e, Symbol.toStringTag, {
        value: "Module"
    }))
}
// ... [le reste du code fourni jusqu'à la fin] ...
export {Nc as A, Vp as P, u as _, Ao as a, ss as b, ts as c, PT as d, as as e, rs as f, o as g, OT as h, So as i, c as j, RT as k, x as l, jT as m, UT as n, Ip as o, Kp as p, GP as q, ko as s, _o as t, xT as u};
