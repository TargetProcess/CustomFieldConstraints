/* eslint no-bitwise:0, operator-assignment:0, padded-blocks: 0, one-var: 0, guard-for-in: 0, newline-after-var: 0 */

const decodeBase64 = function(s) {
    var e = {}, i, v = [], r = '', w = String.fromCharCode, z;
    var n = [
        [65, 91],
        [97, 123],
        [48, 58],
        [43, 44],
        [47, 48]
    ];

    for (z in n) {
        for (i = n[z][0]; i < n[z][1]; i++) {
            v.push(w(i));
        }
    }
    for (i = 0; i < 64; i++) {
        e[v[i]] = i;
    }

    for (i = 0; i < s.length; i += 72) {
        var b = 0, c, x, l = 0, o = s.substring(i, i + 72);
        for (x = 0; x < o.length; x++) {
            c = e[o.charAt(x)];
            b = (b << 6) + c;
            l += 6;
            while (l >= 8) {
                r += w((b >>> (l -= 8)) % 256);
            }
        }
    }
    return r.replace(/[^\w\s]/gi, '');
};

export default (value) => {

    if (!value || value.indexOf('b64_') !== 0) return value;

    var encoded = value;
    encoded = encoded.replace(/_0/g, '+');
    encoded = encoded.replace(/_1/g, '/');
    encoded = encoded.replace(/_2/g, '=');
    encoded = encoded.substring(4, encoded.length - 1);

    return decodeBase64(encoded);

};
