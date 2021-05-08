;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['ProgressivePromise'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('ProgressivePromise'));
  } else {
    root.untar = factory(root.ProgressivePromise);
  }
}(this, function(ProgressivePromise) {
"use strict";
/* globals Blob: false, Promise: false, console: false, Worker: false, ProgressivePromise: false */

var workerScriptUri; // Included at compile time

var global = window || this;

var URL = global.URL || global.webkitURL;

/**
 Returns a ProgressivePromise.
 */
function untar(arrayBuffer) {
    if (!(arrayBuffer instanceof ArrayBuffer)) {
        throw new TypeError("arrayBuffer is not an instance of ArrayBuffer.");
    }

    if (!global.Worker) {
        throw new Error("Worker implementation is not available in this environment.");
    }

    return new ProgressivePromise(function (resolve, reject, progress) {
        var worker = new Worker(workerScriptUri);

        var files = [];

        worker.onerror = function (err) {
            reject(err);
        };

        worker.onmessage = function (message) {
            message = message.data;

            switch (message.type) {
                case "log":
                    console[message.data.level]("Worker: " + message.data.msg);
                    break;
                case "extract":
                    var file = decorateExtractedFile(message.data);
                    files.push(file);
                    progress(file);
                    break;
                case "complete":
                    worker.terminate();
                    resolve(files);
                    break;
                case "error":
                    //console.log("error message");
                    worker.terminate();
                    reject(new Error(message.data.message));
                    break;
                default:
                    worker.terminate();
                    reject(new Error("Unknown message from worker: " + message.type));
                    break;
            }
        };

        //console.info("Sending arraybuffer to worker for extraction.");
        worker.postMessage({type: "extract", buffer: arrayBuffer}, [arrayBuffer]);
    });
}

var decoratedFileProps = {
    blob: {
        get: function () {
            return this._blob || (this._blob = new Blob([this.buffer]));
        }
    },
    getBlobUrl: {
        value: function () {
            return this._blobUrl || (this._blobUrl = URL.createObjectURL(this.blob));
        }
    },
    readAsString: {
        value: function (encoding) {
            encoding = encoding || 'utf-8';
            if (window.TextDecoder) {
                var decoder = new TextDecoder(encoding);
                return decoder.decode(this.buffer);
            } else {
                var buffer = this.buffer;
                var charCount = buffer.byteLength;
                var charSize = 1;
                var byteCount = charCount * charSize;
                var bufferView = new DataView(buffer);

                var charCodes = [];

                for (var i = 0; i < charCount; ++i) {
                    var charCode = bufferView.getUint8(i * charSize, true);
                    charCodes.push(charCode);
                }

                return (this._string = String.fromCharCode.apply(null, charCodes));
            }
        }
    },
    readAsJSON: {
        value: function () {
            return JSON.parse(this.readAsString());
        }
    }
};

function decorateExtractedFile(file) {
    Object.defineProperties(file, decoratedFileProps);
    return file;
}

workerScriptUri = '/base/build/dev/untar-worker.js';
return untar;
}));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ1bnRhci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBnbG9iYWxzIEJsb2I6IGZhbHNlLCBQcm9taXNlOiBmYWxzZSwgY29uc29sZTogZmFsc2UsIFdvcmtlcjogZmFsc2UsIFByb2dyZXNzaXZlUHJvbWlzZTogZmFsc2UgKi9cblxudmFyIHdvcmtlclNjcmlwdFVyaTsgLy8gSW5jbHVkZWQgYXQgY29tcGlsZSB0aW1lXG5cbnZhciBnbG9iYWwgPSB3aW5kb3cgfHwgdGhpcztcblxudmFyIFVSTCA9IGdsb2JhbC5VUkwgfHwgZ2xvYmFsLndlYmtpdFVSTDtcblxuLyoqXG4gUmV0dXJucyBhIFByb2dyZXNzaXZlUHJvbWlzZS5cbiAqL1xuZnVuY3Rpb24gdW50YXIoYXJyYXlCdWZmZXIpIHtcbiAgICBpZiAoIShhcnJheUJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYXJyYXlCdWZmZXIgaXMgbm90IGFuIGluc3RhbmNlIG9mIEFycmF5QnVmZmVyLlwiKTtcbiAgICB9XG5cbiAgICBpZiAoIWdsb2JhbC5Xb3JrZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiV29ya2VyIGltcGxlbWVudGF0aW9uIGlzIG5vdCBhdmFpbGFibGUgaW4gdGhpcyBlbnZpcm9ubWVudC5cIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9ncmVzc2l2ZVByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCwgcHJvZ3Jlc3MpIHtcbiAgICAgICAgdmFyIHdvcmtlciA9IG5ldyBXb3JrZXIod29ya2VyU2NyaXB0VXJpKTtcblxuICAgICAgICB2YXIgZmlsZXMgPSBbXTtcblxuICAgICAgICB3b3JrZXIub25lcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHdvcmtlci5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UuZGF0YTtcblxuICAgICAgICAgICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwibG9nXCI6XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGVbbWVzc2FnZS5kYXRhLmxldmVsXShcIldvcmtlcjogXCIgKyBtZXNzYWdlLmRhdGEubXNnKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcImV4dHJhY3RcIjpcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZpbGUgPSBkZWNvcmF0ZUV4dHJhY3RlZEZpbGUobWVzc2FnZS5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgZmlsZXMucHVzaChmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3MoZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJjb21wbGV0ZVwiOlxuICAgICAgICAgICAgICAgICAgICB3b3JrZXIudGVybWluYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmlsZXMpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcImVycm9yIG1lc3NhZ2VcIik7XG4gICAgICAgICAgICAgICAgICAgIHdvcmtlci50ZXJtaW5hdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihtZXNzYWdlLmRhdGEubWVzc2FnZSkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB3b3JrZXIudGVybWluYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJVbmtub3duIG1lc3NhZ2UgZnJvbSB3b3JrZXI6IFwiICsgbWVzc2FnZS50eXBlKSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vY29uc29sZS5pbmZvKFwiU2VuZGluZyBhcnJheWJ1ZmZlciB0byB3b3JrZXIgZm9yIGV4dHJhY3Rpb24uXCIpO1xuICAgICAgICB3b3JrZXIucG9zdE1lc3NhZ2Uoe3R5cGU6IFwiZXh0cmFjdFwiLCBidWZmZXI6IGFycmF5QnVmZmVyfSwgW2FycmF5QnVmZmVyXSk7XG4gICAgfSk7XG59XG5cbnZhciBkZWNvcmF0ZWRGaWxlUHJvcHMgPSB7XG4gICAgYmxvYjoge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9ibG9iIHx8ICh0aGlzLl9ibG9iID0gbmV3IEJsb2IoW3RoaXMuYnVmZmVyXSkpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBnZXRCbG9iVXJsOiB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYmxvYlVybCB8fCAodGhpcy5fYmxvYlVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwodGhpcy5ibG9iKSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHJlYWRBc1N0cmluZzoge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKGVuY29kaW5nKSB7XG4gICAgICAgICAgICBlbmNvZGluZyA9IGVuY29kaW5nIHx8ICd1dGYtOCc7XG4gICAgICAgICAgICBpZiAod2luZG93LlRleHREZWNvZGVyKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoZW5jb2RpbmcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWNvZGVyLmRlY29kZSh0aGlzLmJ1ZmZlcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBidWZmZXIgPSB0aGlzLmJ1ZmZlcjtcbiAgICAgICAgICAgICAgICB2YXIgY2hhckNvdW50ID0gYnVmZmVyLmJ5dGVMZW5ndGg7XG4gICAgICAgICAgICAgICAgdmFyIGNoYXJTaXplID0gMTtcbiAgICAgICAgICAgICAgICB2YXIgYnl0ZUNvdW50ID0gY2hhckNvdW50ICogY2hhclNpemU7XG4gICAgICAgICAgICAgICAgdmFyIGJ1ZmZlclZpZXcgPSBuZXcgRGF0YVZpZXcoYnVmZmVyKTtcblxuICAgICAgICAgICAgICAgIHZhciBjaGFyQ29kZXMgPSBbXTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hhckNvdW50OyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoYXJDb2RlID0gYnVmZmVyVmlldy5nZXRVaW50OChpICogY2hhclNpemUsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBjaGFyQ29kZXMucHVzaChjaGFyQ29kZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuICh0aGlzLl9zdHJpbmcgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGNoYXJDb2RlcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICByZWFkQXNKU09OOiB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSh0aGlzLnJlYWRBc1N0cmluZygpKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmZ1bmN0aW9uIGRlY29yYXRlRXh0cmFjdGVkRmlsZShmaWxlKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZmlsZSwgZGVjb3JhdGVkRmlsZVByb3BzKTtcbiAgICByZXR1cm4gZmlsZTtcbn1cbiJdLCJmaWxlIjoidW50YXIuanMifQ==
