// Polyfill for Node 18 compatibility
import { File, Blob } from 'node:buffer';

if (typeof (global as any).File === 'undefined') {
    (global as any).File = File;
}
if (typeof (global as any).Blob === 'undefined') {
    (global as any).Blob = Blob;
}

if (typeof String.prototype.toWellFormed === 'undefined') {
    Object.defineProperty(String.prototype, 'toWellFormed', {
        value: function () {
            return String(this).replace(
                /([\uD800-\uDBFF](?![\uDC00-\uDFFF]))|((?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g,
                function (match, p1, p2) {
                    if (p1) return '\uFFFD';
                    return p2[0] === match[0] ? '\uFFFD' : p2[0] + '\uFFFD';
                }
            );
        },
        writable: true,
        enumerable: false,
        configurable: true,
    });
}

export { };
