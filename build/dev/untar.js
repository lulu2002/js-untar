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

	return new ProgressivePromise(function(resolve, reject, progress) {
		var worker = new Worker(workerScriptUri);

		var files = [];

		worker.onerror = function(err) {
			reject(err);
		};

		worker.onmessage = function(message) {
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
		worker.postMessage({ type: "extract", buffer: arrayBuffer }, [arrayBuffer]);
	});
}

var decoratedFileProps = {
	blob: {
		get: function() {
			return this._blob || (this._blob = new Blob([this.buffer]));
		}
	},
	getBlobUrl: {
		value: function() {
			return this._blobUrl || (this._blobUrl = URL.createObjectURL(this.blob));
		}
	},
	readAsString: {
		value: function(encoding) {
			encoding = encoding || 'utf-8';
			if (global.TextDecoder) {				
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
		value: function() {
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ1bnRhci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBnbG9iYWxzIEJsb2I6IGZhbHNlLCBQcm9taXNlOiBmYWxzZSwgY29uc29sZTogZmFsc2UsIFdvcmtlcjogZmFsc2UsIFByb2dyZXNzaXZlUHJvbWlzZTogZmFsc2UgKi9cblxudmFyIHdvcmtlclNjcmlwdFVyaTsgLy8gSW5jbHVkZWQgYXQgY29tcGlsZSB0aW1lXG5cbnZhciBnbG9iYWwgPSB3aW5kb3cgfHwgdGhpcztcblxudmFyIFVSTCA9IGdsb2JhbC5VUkwgfHwgZ2xvYmFsLndlYmtpdFVSTDtcblxuLyoqXG5SZXR1cm5zIGEgUHJvZ3Jlc3NpdmVQcm9taXNlLlxuKi9cbmZ1bmN0aW9uIHVudGFyKGFycmF5QnVmZmVyKSB7XG5cdGlmICghKGFycmF5QnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcImFycmF5QnVmZmVyIGlzIG5vdCBhbiBpbnN0YW5jZSBvZiBBcnJheUJ1ZmZlci5cIik7XG5cdH1cblxuXHRpZiAoIWdsb2JhbC5Xb3JrZXIpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJXb3JrZXIgaW1wbGVtZW50YXRpb24gaXMgbm90IGF2YWlsYWJsZSBpbiB0aGlzIGVudmlyb25tZW50LlwiKTtcblx0fVxuXG5cdHJldHVybiBuZXcgUHJvZ3Jlc3NpdmVQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCwgcHJvZ3Jlc3MpIHtcblx0XHR2YXIgd29ya2VyID0gbmV3IFdvcmtlcih3b3JrZXJTY3JpcHRVcmkpO1xuXG5cdFx0dmFyIGZpbGVzID0gW107XG5cblx0XHR3b3JrZXIub25lcnJvciA9IGZ1bmN0aW9uKGVycikge1xuXHRcdFx0cmVqZWN0KGVycik7XG5cdFx0fTtcblxuXHRcdHdvcmtlci5vbm1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdFx0XHRtZXNzYWdlID0gbWVzc2FnZS5kYXRhO1xuXG5cdFx0XHRzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuXHRcdFx0XHRjYXNlIFwibG9nXCI6XG5cdFx0XHRcdFx0Y29uc29sZVttZXNzYWdlLmRhdGEubGV2ZWxdKFwiV29ya2VyOiBcIiArIG1lc3NhZ2UuZGF0YS5tc2cpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiZXh0cmFjdFwiOlxuXHRcdFx0XHRcdHZhciBmaWxlID0gZGVjb3JhdGVFeHRyYWN0ZWRGaWxlKG1lc3NhZ2UuZGF0YSk7XG5cdFx0XHRcdFx0ZmlsZXMucHVzaChmaWxlKTtcblx0XHRcdFx0XHRwcm9ncmVzcyhmaWxlKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcImNvbXBsZXRlXCI6XG5cdFx0XHRcdFx0d29ya2VyLnRlcm1pbmF0ZSgpO1xuXHRcdFx0XHRcdHJlc29sdmUoZmlsZXMpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiZXJyb3JcIjpcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKFwiZXJyb3IgbWVzc2FnZVwiKTtcblx0XHRcdFx0XHR3b3JrZXIudGVybWluYXRlKCk7XG5cdFx0XHRcdFx0cmVqZWN0KG5ldyBFcnJvcihtZXNzYWdlLmRhdGEubWVzc2FnZSkpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHdvcmtlci50ZXJtaW5hdGUoKTtcblx0XHRcdFx0XHRyZWplY3QobmV3IEVycm9yKFwiVW5rbm93biBtZXNzYWdlIGZyb20gd29ya2VyOiBcIiArIG1lc3NhZ2UudHlwZSkpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvL2NvbnNvbGUuaW5mbyhcIlNlbmRpbmcgYXJyYXlidWZmZXIgdG8gd29ya2VyIGZvciBleHRyYWN0aW9uLlwiKTtcblx0XHR3b3JrZXIucG9zdE1lc3NhZ2UoeyB0eXBlOiBcImV4dHJhY3RcIiwgYnVmZmVyOiBhcnJheUJ1ZmZlciB9LCBbYXJyYXlCdWZmZXJdKTtcblx0fSk7XG59XG5cbnZhciBkZWNvcmF0ZWRGaWxlUHJvcHMgPSB7XG5cdGJsb2I6IHtcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2Jsb2IgfHwgKHRoaXMuX2Jsb2IgPSBuZXcgQmxvYihbdGhpcy5idWZmZXJdKSk7XG5cdFx0fVxuXHR9LFxuXHRnZXRCbG9iVXJsOiB7XG5cdFx0dmFsdWU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2Jsb2JVcmwgfHwgKHRoaXMuX2Jsb2JVcmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHRoaXMuYmxvYikpO1xuXHRcdH1cblx0fSxcblx0cmVhZEFzU3RyaW5nOiB7XG5cdFx0dmFsdWU6IGZ1bmN0aW9uKGVuY29kaW5nKSB7XG5cdFx0XHRlbmNvZGluZyA9IGVuY29kaW5nIHx8ICd1dGYtOCc7XG5cdFx0XHRpZiAoZ2xvYmFsLlRleHREZWNvZGVyKSB7XHRcdFx0XHRcblx0XHRcdFx0dmFyIGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoZW5jb2RpbmcpO1xuXHRcdFx0XHRyZXR1cm4gZGVjb2Rlci5kZWNvZGUodGhpcy5idWZmZXIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIGJ1ZmZlciA9IHRoaXMuYnVmZmVyO1xuXHRcdFx0XHR2YXIgY2hhckNvdW50ID0gYnVmZmVyLmJ5dGVMZW5ndGg7XG5cdFx0XHRcdHZhciBjaGFyU2l6ZSA9IDE7XG5cdFx0XHRcdHZhciBieXRlQ291bnQgPSBjaGFyQ291bnQgKiBjaGFyU2l6ZTtcblx0XHRcdFx0dmFyIGJ1ZmZlclZpZXcgPSBuZXcgRGF0YVZpZXcoYnVmZmVyKTtcblxuXHRcdFx0XHR2YXIgY2hhckNvZGVzID0gW107XG5cblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjaGFyQ291bnQ7ICsraSkge1xuXHRcdFx0XHRcdHZhciBjaGFyQ29kZSA9IGJ1ZmZlclZpZXcuZ2V0VWludDgoaSAqIGNoYXJTaXplLCB0cnVlKTtcblx0XHRcdFx0XHRjaGFyQ29kZXMucHVzaChjaGFyQ29kZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gKHRoaXMuX3N0cmluZyA9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgY2hhckNvZGVzKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRyZWFkQXNKU09OOiB7XG5cdFx0dmFsdWU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIEpTT04ucGFyc2UodGhpcy5yZWFkQXNTdHJpbmcoKSk7XG5cdFx0fVxuXHR9XG59O1xuXG5mdW5jdGlvbiBkZWNvcmF0ZUV4dHJhY3RlZEZpbGUoZmlsZSkge1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydGllcyhmaWxlLCBkZWNvcmF0ZWRGaWxlUHJvcHMpO1xuXHRyZXR1cm4gZmlsZTtcbn1cbiJdLCJmaWxlIjoidW50YXIuanMifQ==
