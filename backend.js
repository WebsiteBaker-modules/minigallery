/*
$(function() {
	if ($('#ratio').prop('checked')) $('#twidth').hide();
	$('#ratio').on('change', function() {
		$('#twidth').toggle(!this.checked);
	});
});
*/
$(function() {
	$('#thumbsize').on('change keydown', function() {
		$('#rethumb').prop('checked', true);
	});
});

/*
 *
 * More info at [www.dropzonejs.com](http://www.dropzonejs.com)
 *
 * Copyright (c) 2012, Matias Meno
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

(function() {
  var Dropzone, Emitter, ExifRestore, camelize, contentLoaded, detectVerticalSquash, drawImageIOSFix, noop, without,
    slice = [].slice,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  noop = function() {};

  Emitter = (function() {
    function Emitter() {}

    Emitter.prototype.addEventListener = Emitter.prototype.on;

    Emitter.prototype.on = function(event, fn) {
      this._callbacks = this._callbacks || {};
      if (!this._callbacks[event]) {
        this._callbacks[event] = [];
      }
      this._callbacks[event].push(fn);
      return this;
    };

    Emitter.prototype.emit = function() {
      var args, callback, callbacks, event, j, len;
      event = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      this._callbacks = this._callbacks || {};
      callbacks = this._callbacks[event];
      if (callbacks) {
        for (j = 0, len = callbacks.length; j < len; j++) {
          callback = callbacks[j];
          callback.apply(this, args);
        }
      }
      return this;
    };

    Emitter.prototype.removeListener = Emitter.prototype.off;

    Emitter.prototype.removeAllListeners = Emitter.prototype.off;

    Emitter.prototype.removeEventListener = Emitter.prototype.off;

    Emitter.prototype.off = function(event, fn) {
      var callback, callbacks, i, j, len;
      if (!this._callbacks || arguments.length === 0) {
        this._callbacks = {};
        return this;
      }
      callbacks = this._callbacks[event];
      if (!callbacks) {
        return this;
      }
      if (arguments.length === 1) {
        delete this._callbacks[event];
        return this;
      }
      for (i = j = 0, len = callbacks.length; j < len; i = ++j) {
        callback = callbacks[i];
        if (callback === fn) {
          callbacks.splice(i, 1);
          break;
        }
      }
      return this;
    };

    return Emitter;

  })();

  Dropzone = (function(superClass) {
    var extend, resolveOption;

    extend1(Dropzone, superClass);

    Dropzone.prototype.Emitter = Emitter;


    /*
    This is a list of all available events you can register on a dropzone object.
    
    You can register an event handler like this:
    
        dropzone.on("dragEnter", function() { });
     */

    Dropzone.prototype.events = ["drop", "dragstart", "dragend", "dragenter", "dragover", "dragleave", "addedfile", "addedfiles", "removedfile", "thumbnail", "error", "errormultiple", "processing", "processingmultiple", "uploadprogress", "totaluploadprogress", "sending", "sendingmultiple", "success", "successmultiple", "canceled", "canceledmultiple", "complete", "completemultiple", "reset", "maxfilesexceeded", "maxfilesreached", "queuecomplete"];

    Dropzone.prototype.defaultOptions = {
      url: null,
      method: "post",
      withCredentials: false,
      timeout: 30000,
      parallelUploads: 2,
      uploadMultiple: false,
      maxFilesize: 256,
      paramName: "file",
      createImageThumbnails: true,
      maxThumbnailFilesize: 20,
      thumbnailWidth: 150,
      thumbnailHeight: 150,
      thumbnailMethod: 'crop',
      resizeWidth: null,
      resizeHeight: null,
      resizeMimeType: null,
      resizeQuality: 0.7,
      resizeMethod: 'contain',
      filesizeBase: 1000,
      maxFiles: null,
      params: {},
      headers: null,
      clickable: true,
      ignoreHiddenFiles: true,
      acceptedFiles: null,
      acceptedMimeTypes: null,
      autoProcessQueue: true,
      autoQueue: true,
      addRemoveLinks: false,
      previewsContainer: null,
      hiddenInputContainer: "body",
      capture: null,
      renameFilename: null,
      renameFile: null,
      forceFallback: false,
      dictDefaultMessage: "Drop files here to upload",
      dictFallbackMessage: "Your browser does not support drag'n'drop file uploads.",
      dictFallbackText: "Please use the fallback form below to upload your files like in the olden days.",
      dictFileTooBig: "File is too big ({{filesize}}MiB). Max filesize: {{maxFilesize}}MiB.",
      dictInvalidFileType: "You can't upload files of this type.",
      dictResponseError: "Server responded with {{statusCode}} code.",
      dictCancelUpload: "Cancel upload",
      dictCancelUploadConfirmation: "Are you sure you want to cancel this upload?",
      dictRemoveFile: "Remove file",
      dictRemoveFileConfirmation: null,
      dictMaxFilesExceeded: "You can not upload any more files.",
      dictFileSizeUnits: {
        tb: "TB",
        gb: "GB",
        mb: "MB",
        kb: "KB",
        b: "b"
      },
      init: function() {
        return noop;
      },
      accept: function(file, done) {
        return done();
      },
      fallback: function() {
        var child, j, len, messageElement, ref, span;
        this.element.className = this.element.className + " dz-browser-not-supported";
        ref = this.element.getElementsByTagName("div");
        for (j = 0, len = ref.length; j < len; j++) {
          child = ref[j];
          if (/(^| )dz-message($| )/.test(child.className)) {
            messageElement = child;
            child.className = "dz-message";
            continue;
          }
        }
        if (!messageElement) {
          messageElement = Dropzone.createElement("<div class=\"dz-message\"><span></span></div>");
          this.element.appendChild(messageElement);
        }
        span = messageElement.getElementsByTagName("span")[0];
        if (span) {
          if (span.textContent != null) {
            span.textContent = this.options.dictFallbackMessage;
          } else if (span.innerText != null) {
            span.innerText = this.options.dictFallbackMessage;
          }
        }
        return this.element.appendChild(this.getFallbackForm());
      },
      resize: function(file, width, height, resizeMethod) {
        var info, srcRatio, trgRatio;
        info = {
          srcX: 0,
          srcY: 0,
          srcWidth: file.width,
          srcHeight: file.height
        };
        srcRatio = file.width / file.height;
        if ((width == null) && (height == null)) {
          width = info.srcWidth;
          height = info.srcHeight;
        } else if (width == null) {
          width = height * srcRatio;
        } else if (height == null) {
          height = width / srcRatio;
        }
        width = Math.min(width, info.srcWidth);
        height = Math.min(height, info.srcHeight);
        trgRatio = width / height;
        if (info.srcWidth > width || info.srcHeight > height) {
          if (resizeMethod === 'crop') {
            if (srcRatio > trgRatio) {
              info.srcHeight = file.height;
              info.srcWidth = info.srcHeight * trgRatio;
            } else {
              info.srcWidth = file.width;
              info.srcHeight = info.srcWidth / trgRatio;
            }
          } else if (resizeMethod === 'contain') {
            if (srcRatio > trgRatio) {
              height = width / srcRatio;
            } else {
              width = height * srcRatio;
            }
          } else {
            throw new Error("Unknown resizeMethod '" + resizeMethod + "'");
          }
        }
        info.srcX = (file.width - info.srcWidth) / 2;
        info.srcY = (file.height - info.srcHeight) / 2;
        info.trgWidth = width;
        info.trgHeight = height;
        return info;
      },
      transformFile: function(file, done) {
        if ((this.options.resizeWidth || this.options.resizeHeight) && file.type.match(/image.*/)) {
          return this.resizeImage(file, this.options.resizeWidth, this.options.resizeHeight, this.options.resizeMethod, done);
        } else {
          return done(file);
        }
      },
      previewTemplate: "<div class=\"dz-preview dz-file-preview\">\n  <div class=\"dz-image\"><img data-dz-thumbnail /></div>\n  <div class=\"dz-details\">\n    <div class=\"dz-size\"><span data-dz-size></span></div>\n    <div class=\"dz-filename\"><span data-dz-name></span></div>\n  </div>\n  <div class=\"dz-progress\"><span class=\"dz-upload\" data-dz-uploadprogress></span></div>\n  <div class=\"dz-error-message\"><span data-dz-errormessage></span></div>\n  <div class=\"dz-success-mark\">\n    <svg width=\"54px\" height=\"54px\" viewBox=\"0 0 54 54\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n      <title>Check</title>\n      <defs></defs>\n      <g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" sketch:type=\"MSPage\">\n        <path d=\"M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z\" id=\"Oval-2\" stroke-opacity=\"0.198794158\" stroke=\"#747474\" fill-opacity=\"0.816519475\" fill=\"#FFFFFF\" sketch:type=\"MSShapeGroup\"></path>\n      </g>\n    </svg>\n  </div>\n  <div class=\"dz-error-mark\">\n    <svg width=\"54px\" height=\"54px\" viewBox=\"0 0 54 54\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n      <title>Error</title>\n      <defs></defs>\n      <g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" sketch:type=\"MSPage\">\n        <g id=\"Check-+-Oval-2\" sketch:type=\"MSLayerGroup\" stroke=\"#747474\" stroke-opacity=\"0.198794158\" fill=\"#FFFFFF\" fill-opacity=\"0.816519475\">\n          <path d=\"M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z\" id=\"Oval-2\" sketch:type=\"MSShapeGroup\"></path>\n        </g>\n      </g>\n    </svg>\n  </div>\n</div>",

      /*
      Those functions register themselves to the events on init and handle all
      the user interface specific stuff. Overwriting them won't break the upload
      but can break the way it's displayed.
      You can overwrite them if you don't like the default behavior. If you just
      want to add an additional event handler, register it on the dropzone object
      and don't overwrite those options.
       */
      drop: function(e) {
        return this.element.classList.remove("dz-drag-hover");
      },
      dragstart: noop,
      dragend: function(e) {
        return this.element.classList.remove("dz-drag-hover");
      },
      dragenter: function(e) {
        return this.element.classList.add("dz-drag-hover");
      },
      dragover: function(e) {
        return this.element.classList.add("dz-drag-hover");
      },
      dragleave: function(e) {
        return this.element.classList.remove("dz-drag-hover");
      },
      paste: noop,
      reset: function() {
        return this.element.classList.remove("dz-started");
      },
      addedfile: function(file) {
        var j, k, l, len, len1, len2, node, ref, ref1, ref2, removeFileEvent, removeLink, results;
        if (this.element === this.previewsContainer) {
          this.element.classList.add("dz-started");
        }
        if (this.previewsContainer) {
          file.previewElement = Dropzone.createElement(this.options.previewTemplate.trim());
          file.previewTemplate = file.previewElement;
          this.previewsContainer.appendChild(file.previewElement);
          ref = file.previewElement.querySelectorAll("[data-dz-name]");
          for (j = 0, len = ref.length; j < len; j++) {
            node = ref[j];
            node.textContent = file.upload.filename;
          }
          ref1 = file.previewElement.querySelectorAll("[data-dz-size]");
          for (k = 0, len1 = ref1.length; k < len1; k++) {
            node = ref1[k];
            node.innerHTML = this.filesize(file.size);
          }
          if (this.options.addRemoveLinks) {
            file._removeLink = Dropzone.createElement("<a class=\"dz-remove\" href=\"javascript:undefined;\" data-dz-remove>" + this.options.dictRemoveFile + "</a>");
            file.previewElement.appendChild(file._removeLink);
          }
          removeFileEvent = (function(_this) {
            return function(e) {
              e.preventDefault();
              e.stopPropagation();
              if (file.status === Dropzone.UPLOADING) {
                return Dropzone.confirm(_this.options.dictCancelUploadConfirmation, function() {
                  return _this.removeFile(file);
                });
              } else {
                if (_this.options.dictRemoveFileConfirmation) {
                  return Dropzone.confirm(_this.options.dictRemoveFileConfirmation, function() {
                    return _this.removeFile(file);
                  });
                } else {
                  return _this.removeFile(file);
                }
              }
            };
          })(this);
          ref2 = file.previewElement.querySelectorAll("[data-dz-remove]");
          results = [];
          for (l = 0, len2 = ref2.length; l < len2; l++) {
            removeLink = ref2[l];
            results.push(removeLink.addEventListener("click", removeFileEvent));
          }
          return results;
        }
      },
      removedfile: function(file) {
        var ref;
        if (file.previewElement) {
          if ((ref = file.previewElement) != null) {
            ref.parentNode.removeChild(file.previewElement);
          }
        }
        return this._updateMaxFilesReachedClass();
      },
      thumbnail: function(file, dataUrl) {
        var j, len, ref, thumbnailElement;
        if (file.previewElement) {
          file.previewElement.classList.remove("dz-file-preview");
          ref = file.previewElement.querySelectorAll("[data-dz-thumbnail]");
          for (j = 0, len = ref.length; j < len; j++) {
            thumbnailElement = ref[j];
            thumbnailElement.alt = file.name;
            thumbnailElement.src = dataUrl;
          }
          return setTimeout(((function(_this) {
            return function() {
              return file.previewElement.classList.add("dz-image-preview");
            };
          })(this)), 1);
        }
      },
      error: function(file, message) {
        var j, len, node, ref, results;
        if (file.previewElement) {
          file.previewElement.classList.add("dz-error");
          if (typeof message !== "String" && message.error) {
            message = message.error;
          }
          ref = file.previewElement.querySelectorAll("[data-dz-errormessage]");
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            node = ref[j];
            results.push(node.textContent = message);
          }
          return results;
        }
      },
      errormultiple: noop,
      processing: function(file) {
        if (file.previewElement) {
          file.previewElement.classList.add("dz-processing");
          if (file._removeLink) {
            return file._removeLink.textContent = this.options.dictCancelUpload;
          }
        }
      },
      processingmultiple: noop,
      uploadprogress: function(file, progress, bytesSent) {
        var j, len, node, ref, results;
        if (file.previewElement) {
          ref = file.previewElement.querySelectorAll("[data-dz-uploadprogress]");
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            node = ref[j];
            if (node.nodeName === 'PROGRESS') {
              results.push(node.value = progress);
            } else {
              results.push(node.style.width = progress + "%");
            }
          }
          return results;
        }
      },
      totaluploadprogress: noop,
      sending: noop,
      sendingmultiple: noop,
      success: function(file) {
        if (file.previewElement) {
          return file.previewElement.classList.add("dz-success");
        }
      },
      successmultiple: noop,
      canceled: function(file) {
        return this.emit("error", file, "Upload canceled.");
      },
      canceledmultiple: noop,
      complete: function(file) {
        if (file._removeLink) {
          file._removeLink.textContent = this.options.dictRemoveFile;
        }
        if (file.previewElement) {
          return file.previewElement.classList.add("dz-complete");
        }
      },
      completemultiple: noop,
      maxfilesexceeded: noop,
      maxfilesreached: noop,
      queuecomplete: noop,
      addedfiles: noop
    };

    extend = function() {
      var j, key, len, object, objects, target, val;
      target = arguments[0], objects = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      for (j = 0, len = objects.length; j < len; j++) {
        object = objects[j];
        for (key in object) {
          val = object[key];
          target[key] = val;
        }
      }
      return target;
    };

    function Dropzone(element1, options) {
      var elementOptions, fallback, ref;
      this.element = element1;
      this.version = Dropzone.version;
      this.defaultOptions.previewTemplate = this.defaultOptions.previewTemplate.replace(/\n*/g, "");
      this.clickableElements = [];
      this.listeners = [];
      this.files = [];
      if (typeof this.element === "string") {
        this.element = document.querySelector(this.element);
      }
      if (!(this.element && (this.element.nodeType != null))) {
        throw new Error("Invalid dropzone element.");
      }
      if (this.element.dropzone) {
        throw new Error("Dropzone already attached.");
      }
      Dropzone.instances.push(this);
      this.element.dropzone = this;
      elementOptions = (ref = Dropzone.optionsForElement(this.element)) != null ? ref : {};
      this.options = extend({}, this.defaultOptions, elementOptions, options != null ? options : {});
      if (this.options.forceFallback || !Dropzone.isBrowserSupported()) {
        return this.options.fallback.call(this);
      }
      if (this.options.url == null) {
        this.options.url = this.element.getAttribute("action");
      }
      if (!this.options.url) {
        throw new Error("No URL provided.");
      }
      if (this.options.acceptedFiles && this.options.acceptedMimeTypes) {
        throw new Error("You can't provide both 'acceptedFiles' and 'acceptedMimeTypes'. 'acceptedMimeTypes' is deprecated.");
      }
      if (this.options.acceptedMimeTypes) {
        this.options.acceptedFiles = this.options.acceptedMimeTypes;
        delete this.options.acceptedMimeTypes;
      }
      if (this.options.renameFilename != null) {
        this.options.renameFile = (function(_this) {
          return function(file) {
            return _this.options.renameFilename.call(_this, file.name, file);
          };
        })(this);
      }
      this.options.method = this.options.method.toUpperCase();
      if ((fallback = this.getExistingFallback()) && fallback.parentNode) {
        fallback.parentNode.removeChild(fallback);
      }
      if (this.options.previewsContainer !== false) {
        if (this.options.previewsContainer) {
          this.previewsContainer = Dropzone.getElement(this.options.previewsContainer, "previewsContainer");
        } else {
          this.previewsContainer = this.element;
        }
      }
      if (this.options.clickable) {
        if (this.options.clickable === true) {
          this.clickableElements = [this.element];
        } else {
          this.clickableElements = Dropzone.getElements(this.options.clickable, "clickable");
        }
      }
      this.init();
    }

    Dropzone.prototype.getAcceptedFiles = function() {
      var file, j, len, ref, results;
      ref = this.files;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        file = ref[j];
        if (file.accepted) {
          results.push(file);
        }
      }
      return results;
    };

    Dropzone.prototype.getRejectedFiles = function() {
      var file, j, len, ref, results;
      ref = this.files;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        file = ref[j];
        if (!file.accepted) {
          results.push(file);
        }
      }
      return results;
    };

    Dropzone.prototype.getFilesWithStatus = function(status) {
      var file, j, len, ref, results;
      ref = this.files;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        file = ref[j];
        if (file.status === status) {
          results.push(file);
        }
      }
      return results;
    };

    Dropzone.prototype.getQueuedFiles = function() {
      return this.getFilesWithStatus(Dropzone.QUEUED);
    };

    Dropzone.prototype.getUploadingFiles = function() {
      return this.getFilesWithStatus(Dropzone.UPLOADING);
    };

    Dropzone.prototype.getAddedFiles = function() {
      return this.getFilesWithStatus(Dropzone.ADDED);
    };

    Dropzone.prototype.getActiveFiles = function() {
      var file, j, len, ref, results;
      ref = this.files;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        file = ref[j];
        if (file.status === Dropzone.UPLOADING || file.status === Dropzone.QUEUED) {
          results.push(file);
        }
      }
      return results;
    };

    Dropzone.prototype.init = function() {
      var eventName, j, len, noPropagation, ref, ref1, setupHiddenFileInput;
      if (this.element.tagName === "form") {
        this.element.setAttribute("enctype", "multipart/form-data");
      }
      if (this.element.classList.contains("dropzone") && !this.element.querySelector(".dz-message")) {
        this.element.appendChild(Dropzone.createElement("<div class=\"dz-default dz-message\"><span>" + this.options.dictDefaultMessage + "</span></div>"));
      }
      if (this.clickableElements.length) {
        setupHiddenFileInput = (function(_this) {
          return function() {
            if (_this.hiddenFileInput) {
              _this.hiddenFileInput.parentNode.removeChild(_this.hiddenFileInput);
            }
            _this.hiddenFileInput = document.createElement("input");
            _this.hiddenFileInput.setAttribute("type", "file");
            if ((_this.options.maxFiles == null) || _this.options.maxFiles > 1) {
              _this.hiddenFileInput.setAttribute("multiple", "multiple");
            }
            _this.hiddenFileInput.className = "dz-hidden-input";
            if (_this.options.acceptedFiles != null) {
              _this.hiddenFileInput.setAttribute("accept", _this.options.acceptedFiles);
            }
            if (_this.options.capture != null) {
              _this.hiddenFileInput.setAttribute("capture", _this.options.capture);
            }
            _this.hiddenFileInput.style.visibility = "hidden";
            _this.hiddenFileInput.style.position = "absolute";
            _this.hiddenFileInput.style.top = "0";
            _this.hiddenFileInput.style.left = "0";
            _this.hiddenFileInput.style.height = "0";
            _this.hiddenFileInput.style.width = "0";
            document.querySelector(_this.options.hiddenInputContainer).appendChild(_this.hiddenFileInput);
            return _this.hiddenFileInput.addEventListener("change", function() {
              var file, files, j, len;
              files = _this.hiddenFileInput.files;
              if (files.length) {
                for (j = 0, len = files.length; j < len; j++) {
                  file = files[j];
                  _this.addFile(file);
                }
              }
              _this.emit("addedfiles", files);
              return setupHiddenFileInput();
            });
          };
        })(this);
        setupHiddenFileInput();
      }
      this.URL = (ref = window.URL) != null ? ref : window.webkitURL;
      ref1 = this.events;
      for (j = 0, len = ref1.length; j < len; j++) {
        eventName = ref1[j];
        this.on(eventName, this.options[eventName]);
      }
      this.on("uploadprogress", (function(_this) {
        return function() {
          return _this.updateTotalUploadProgress();
        };
      })(this));
      this.on("removedfile", (function(_this) {
        return function() {
          return _this.updateTotalUploadProgress();
        };
      })(this));
      this.on("canceled", (function(_this) {
        return function(file) {
          return _this.emit("complete", file);
        };
      })(this));
      this.on("complete", (function(_this) {
        return function(file) {
          if (_this.getAddedFiles().length === 0 && _this.getUploadingFiles().length === 0 && _this.getQueuedFiles().length === 0) {
            return setTimeout((function() {
              return _this.emit("queuecomplete");
            }), 0);
          }
        };
      })(this));
      noPropagation = function(e) {
        e.stopPropagation();
        if (e.preventDefault) {
          return e.preventDefault();
        } else {
          return e.returnValue = false;
        }
      };
      this.listeners = [
        {
          element: this.element,
          events: {
            "dragstart": (function(_this) {
              return function(e) {
                return _this.emit("dragstart", e);
              };
            })(this),
            "dragenter": (function(_this) {
              return function(e) {
                noPropagation(e);
                return _this.emit("dragenter", e);
              };
            })(this),
            "dragover": (function(_this) {
              return function(e) {
                var efct;
                try {
                  efct = e.dataTransfer.effectAllowed;
                } catch (undefined) {}
                e.dataTransfer.dropEffect = 'move' === efct || 'linkMove' === efct ? 'move' : 'copy';
                noPropagation(e);
                return _this.emit("dragover", e);
              };
            })(this),
            "dragleave": (function(_this) {
              return function(e) {
                return _this.emit("dragleave", e);
              };
            })(this),
            "drop": (function(_this) {
              return function(e) {
                noPropagation(e);
                return _this.drop(e);
              };
            })(this),
            "dragend": (function(_this) {
              return function(e) {
                return _this.emit("dragend", e);
              };
            })(this)
          }
        }
      ];
      this.clickableElements.forEach((function(_this) {
        return function(clickableElement) {
          return _this.listeners.push({
            element: clickableElement,
            events: {
              "click": function(evt) {
                if ((clickableElement !== _this.element) || (evt.target === _this.element || Dropzone.elementInside(evt.target, _this.element.querySelector(".dz-message")))) {
                  _this.hiddenFileInput.click();
                }
                return true;
              }
            }
          });
        };
      })(this));
      this.enable();
      return this.options.init.call(this);
    };

    Dropzone.prototype.destroy = function() {
      var ref;
      this.disable();
      this.removeAllFiles(true);
      if ((ref = this.hiddenFileInput) != null ? ref.parentNode : void 0) {
        this.hiddenFileInput.parentNode.removeChild(this.hiddenFileInput);
        this.hiddenFileInput = null;
      }
      delete this.element.dropzone;
      return Dropzone.instances.splice(Dropzone.instances.indexOf(this), 1);
    };

    Dropzone.prototype.updateTotalUploadProgress = function() {
      var activeFiles, file, j, len, ref, totalBytes, totalBytesSent, totalUploadProgress;
      totalBytesSent = 0;
      totalBytes = 0;
      activeFiles = this.getActiveFiles();
      if (activeFiles.length) {
        ref = this.getActiveFiles();
        for (j = 0, len = ref.length; j < len; j++) {
          file = ref[j];
          totalBytesSent += file.upload.bytesSent;
          totalBytes += file.upload.total;
        }
        totalUploadProgress = 100 * totalBytesSent / totalBytes;
      } else {
        totalUploadProgress = 100;
      }
      return this.emit("totaluploadprogress", totalUploadProgress, totalBytes, totalBytesSent);
    };

    Dropzone.prototype._getParamName = function(n) {
      if (typeof this.options.paramName === "function") {
        return this.options.paramName(n);
      } else {
        return "" + this.options.paramName + (this.options.uploadMultiple ? "[" + n + "]" : "");
      }
    };

    Dropzone.prototype._renameFile = function(file) {
      if (typeof this.options.renameFile !== "function") {
        return file.name;
      }
      return this.options.renameFile(file);
    };

    Dropzone.prototype.getFallbackForm = function() {
      var existingFallback, fields, fieldsString, form;
      if (existingFallback = this.getExistingFallback()) {
        return existingFallback;
      }
      fieldsString = "<div class=\"dz-fallback\">";
      if (this.options.dictFallbackText) {
        fieldsString += "<p>" + this.options.dictFallbackText + "</p>";
      }
      fieldsString += "<input type=\"file\" name=\"" + (this._getParamName(0)) + "\" " + (this.options.uploadMultiple ? 'multiple="multiple"' : void 0) + " /><input type=\"submit\" value=\"Upload!\"></div>";
      fields = Dropzone.createElement(fieldsString);
      if (this.element.tagName !== "FORM") {
        form = Dropzone.createElement("<form action=\"" + this.options.url + "\" enctype=\"multipart/form-data\" method=\"" + this.options.method + "\"></form>");
        form.appendChild(fields);
      } else {
        this.element.setAttribute("enctype", "multipart/form-data");
        this.element.setAttribute("method", this.options.method);
      }
      return form != null ? form : fields;
    };

    Dropzone.prototype.getExistingFallback = function() {
      var fallback, getFallback, j, len, ref, tagName;
      getFallback = function(elements) {
        var el, j, len;
        for (j = 0, len = elements.length; j < len; j++) {
          el = elements[j];
          if (/(^| )fallback($| )/.test(el.className)) {
            return el;
          }
        }
      };
      ref = ["div", "form"];
      for (j = 0, len = ref.length; j < len; j++) {
        tagName = ref[j];
        if (fallback = getFallback(this.element.getElementsByTagName(tagName))) {
          return fallback;
        }
      }
    };

    Dropzone.prototype.setupEventListeners = function() {
      var elementListeners, event, j, len, listener, ref, results;
      ref = this.listeners;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        elementListeners = ref[j];
        results.push((function() {
          var ref1, results1;
          ref1 = elementListeners.events;
          results1 = [];
          for (event in ref1) {
            listener = ref1[event];
            results1.push(elementListeners.element.addEventListener(event, listener, false));
          }
          return results1;
        })());
      }
      return results;
    };

    Dropzone.prototype.removeEventListeners = function() {
      var elementListeners, event, j, len, listener, ref, results;
      ref = this.listeners;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        elementListeners = ref[j];
        results.push((function() {
          var ref1, results1;
          ref1 = elementListeners.events;
          results1 = [];
          for (event in ref1) {
            listener = ref1[event];
            results1.push(elementListeners.element.removeEventListener(event, listener, false));
          }
          return results1;
        })());
      }
      return results;
    };

    Dropzone.prototype.disable = function() {
      var file, j, len, ref, results;
      this.clickableElements.forEach(function(element) {
        return element.classList.remove("dz-clickable");
      });
      this.removeEventListeners();
      ref = this.files;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        file = ref[j];
        results.push(this.cancelUpload(file));
      }
      return results;
    };

    Dropzone.prototype.enable = function() {
      this.clickableElements.forEach(function(element) {
        return element.classList.add("dz-clickable");
      });
      return this.setupEventListeners();
    };

    Dropzone.prototype.filesize = function(size) {
      var cutoff, i, j, len, selectedSize, selectedUnit, unit, units;
      selectedSize = 0;
      selectedUnit = "b";
      if (size > 0) {
        units = ['tb', 'gb', 'mb', 'kb', 'b'];
        for (i = j = 0, len = units.length; j < len; i = ++j) {
          unit = units[i];
          cutoff = Math.pow(this.options.filesizeBase, 4 - i) / 10;
          if (size >= cutoff) {
            selectedSize = size / Math.pow(this.options.filesizeBase, 4 - i);
            selectedUnit = unit;
            break;
          }
        }
        selectedSize = Math.round(10 * selectedSize) / 10;
      }
      return "<strong>" + selectedSize + "</strong> " + this.options.dictFileSizeUnits[selectedUnit];
    };

    Dropzone.prototype._updateMaxFilesReachedClass = function() {
      if ((this.options.maxFiles != null) && this.getAcceptedFiles().length >= this.options.maxFiles) {
        if (this.getAcceptedFiles().length === this.options.maxFiles) {
          this.emit('maxfilesreached', this.files);
        }
        return this.element.classList.add("dz-max-files-reached");
      } else {
        return this.element.classList.remove("dz-max-files-reached");
      }
    };

    Dropzone.prototype.drop = function(e) {
      var files, items;
      if (!e.dataTransfer) {
        return;
      }
      this.emit("drop", e);
      files = e.dataTransfer.files;
      this.emit("addedfiles", files);
      if (files.length) {
        items = e.dataTransfer.items;
        if (items && items.length && (items[0].webkitGetAsEntry != null)) {
          this._addFilesFromItems(items);
        } else {
          this.handleFiles(files);
        }
      }
    };

    Dropzone.prototype.paste = function(e) {
      var items, ref;
      if ((e != null ? (ref = e.clipboardData) != null ? ref.items : void 0 : void 0) == null) {
        return;
      }
      this.emit("paste", e);
      items = e.clipboardData.items;
      if (items.length) {
        return this._addFilesFromItems(items);
      }
    };

    Dropzone.prototype.handleFiles = function(files) {
      var file, j, len, results;
      results = [];
      for (j = 0, len = files.length; j < len; j++) {
        file = files[j];
        results.push(this.addFile(file));
      }
      return results;
    };

    Dropzone.prototype._addFilesFromItems = function(items) {
      var entry, item, j, len, results;
      results = [];
      for (j = 0, len = items.length; j < len; j++) {
        item = items[j];
        if ((item.webkitGetAsEntry != null) && (entry = item.webkitGetAsEntry())) {
          if (entry.isFile) {
            results.push(this.addFile(item.getAsFile()));
          } else if (entry.isDirectory) {
            results.push(this._addFilesFromDirectory(entry, entry.name));
          } else {
            results.push(void 0);
          }
        } else if (item.getAsFile != null) {
          if ((item.kind == null) || item.kind === "file") {
            results.push(this.addFile(item.getAsFile()));
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    Dropzone.prototype._addFilesFromDirectory = function(directory, path) {
      var dirReader, errorHandler, readEntries;
      dirReader = directory.createReader();
      errorHandler = function(error) {
        return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log(error) : void 0 : void 0;
      };
      readEntries = (function(_this) {
        return function() {
          return dirReader.readEntries(function(entries) {
            var entry, j, len;
            if (entries.length > 0) {
              for (j = 0, len = entries.length; j < len; j++) {
                entry = entries[j];
                if (entry.isFile) {
                  entry.file(function(file) {
                    if (_this.options.ignoreHiddenFiles && file.name.substring(0, 1) === '.') {
                      return;
                    }
                    file.fullPath = path + "/" + file.name;
                    return _this.addFile(file);
                  });
                } else if (entry.isDirectory) {
                  _this._addFilesFromDirectory(entry, path + "/" + entry.name);
                }
              }
              readEntries();
            }
            return null;
          }, errorHandler);
        };
      })(this);
      return readEntries();
    };

    Dropzone.prototype.accept = function(file, done) {
      if (file.size > this.options.maxFilesize * 1024 * 1024) {
        return done(this.options.dictFileTooBig.replace("{{filesize}}", Math.round(file.size / 1024 / 10.24) / 100).replace("{{maxFilesize}}", this.options.maxFilesize));
      } else if (!Dropzone.isValidFile(file, this.options.acceptedFiles)) {
        return done(this.options.dictInvalidFileType);
      } else if ((this.options.maxFiles != null) && this.getAcceptedFiles().length >= this.options.maxFiles) {
        done(this.options.dictMaxFilesExceeded.replace("{{maxFiles}}", this.options.maxFiles));
        return this.emit("maxfilesexceeded", file);
      } else {
        return this.options.accept.call(this, file, done);
      }
    };

    Dropzone.prototype.addFile = function(file) {
      file.upload = {
        progress: 0,
        total: file.size,
        bytesSent: 0,
        filename: this._renameFile(file)
      };
      this.files.push(file);
      file.status = Dropzone.ADDED;
      this.emit("addedfile", file);
      this._enqueueThumbnail(file);
      return this.accept(file, (function(_this) {
        return function(error) {
          if (error) {
            file.accepted = false;
            _this._errorProcessing([file], error);
          } else {
            file.accepted = true;
            if (_this.options.autoQueue) {
              _this.enqueueFile(file);
            }
          }
          return _this._updateMaxFilesReachedClass();
        };
      })(this));
    };

    Dropzone.prototype.enqueueFiles = function(files) {
      var file, j, len;
      for (j = 0, len = files.length; j < len; j++) {
        file = files[j];
        this.enqueueFile(file);
      }
      return null;
    };

    Dropzone.prototype.enqueueFile = function(file) {
      if (file.status === Dropzone.ADDED && file.accepted === true) {
        file.status = Dropzone.QUEUED;
        if (this.options.autoProcessQueue) {
          return setTimeout(((function(_this) {
            return function() {
              return _this.processQueue();
            };
          })(this)), 0);
        }
      } else {
        throw new Error("This file can't be queued because it has already been processed or was rejected.");
      }
    };

    Dropzone.prototype._thumbnailQueue = [];

    Dropzone.prototype._processingThumbnail = false;

    Dropzone.prototype._enqueueThumbnail = function(file) {
      if (this.options.createImageThumbnails && file.type.match(/image.*/) && file.size <= this.options.maxThumbnailFilesize * 1024 * 1024) {
        this._thumbnailQueue.push(file);
        return setTimeout(((function(_this) {
          return function() {
            return _this._processThumbnailQueue();
          };
        })(this)), 0);
      }
    };

    Dropzone.prototype._processThumbnailQueue = function() {
      var file;
      if (this._processingThumbnail || this._thumbnailQueue.length === 0) {
        return;
      }
      this._processingThumbnail = true;
      file = this._thumbnailQueue.shift();
      return this.createThumbnail(file, this.options.thumbnailWidth, this.options.thumbnailHeight, this.options.thumbnailMethod, true, (function(_this) {
        return function(dataUrl) {
          _this.emit("thumbnail", file, dataUrl);
          _this._processingThumbnail = false;
          return _this._processThumbnailQueue();
        };
      })(this));
    };

    Dropzone.prototype.removeFile = function(file) {
      if (file.status === Dropzone.UPLOADING) {
        this.cancelUpload(file);
      }
      this.files = without(this.files, file);
      this.emit("removedfile", file);
      if (this.files.length === 0) {
        return this.emit("reset");
      }
    };

    Dropzone.prototype.removeAllFiles = function(cancelIfNecessary) {
      var file, j, len, ref;
      if (cancelIfNecessary == null) {
        cancelIfNecessary = false;
      }
      ref = this.files.slice();
      for (j = 0, len = ref.length; j < len; j++) {
        file = ref[j];
        if (file.status !== Dropzone.UPLOADING || cancelIfNecessary) {
          this.removeFile(file);
        }
      }
      return null;
    };

    Dropzone.prototype.resizeImage = function(file, width, height, resizeMethod, callback) {
      return this.createThumbnail(file, width, height, resizeMethod, false, (function(_this) {
        return function(dataUrl, canvas) {
          var resizeMimeType, resizedDataURL;
          if (canvas === null) {
            return callback(file);
          } else {
            resizeMimeType = _this.options.resizeMimeType;
            if (resizeMimeType == null) {
              resizeMimeType = file.type;
            }
            resizedDataURL = canvas.toDataURL(resizeMimeType, _this.options.resizeQuality);
            if (resizeMimeType === 'image/jpeg' || resizeMimeType === 'image/jpg') {
              resizedDataURL = ExifRestore.restore(file.dataURL, resizedDataURL);
            }
            return callback(Dropzone.dataURItoBlob(resizedDataURL));
          }
        };
      })(this));
    };

    Dropzone.prototype.createThumbnail = function(file, width, height, resizeMethod, fixOrientation, callback) {
      var fileReader;
      fileReader = new FileReader;
      fileReader.onload = (function(_this) {
        return function() {
          file.dataURL = fileReader.result;
          if (file.type === "image/svg+xml") {
            if (callback != null) {
              callback(fileReader.result);
            }
            return;
          }
          return _this.createThumbnailFromUrl(file, width, height, resizeMethod, fixOrientation, callback);
        };
      })(this);
      return fileReader.readAsDataURL(file);
    };

    Dropzone.prototype.createThumbnailFromUrl = function(file, width, height, resizeMethod, fixOrientation, callback, crossOrigin) {
      var img;
      img = document.createElement("img");
      if (crossOrigin) {
        img.crossOrigin = crossOrigin;
      }
      img.onload = (function(_this) {
        return function() {
          var loadExif;
          loadExif = function(callback) {
            return callback(1);
          };
          if ((typeof EXIF !== "undefined" && EXIF !== null) && fixOrientation) {
            loadExif = function(callback) {
              return EXIF.getData(img, function() {
                return callback(EXIF.getTag(this, 'Orientation'));
              });
            };
          }
          return loadExif(function(orientation) {
            var canvas, ctx, ref, ref1, ref2, ref3, resizeInfo, thumbnail;
            file.width = img.width;
            file.height = img.height;
            resizeInfo = _this.options.resize.call(_this, file, width, height, resizeMethod);
            canvas = document.createElement("canvas");
            ctx = canvas.getContext("2d");
            canvas.width = resizeInfo.trgWidth;
            canvas.height = resizeInfo.trgHeight;
            if (orientation > 4) {
              canvas.width = resizeInfo.trgHeight;
              canvas.height = resizeInfo.trgWidth;
            }
            switch (orientation) {
              case 2:
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
                break;
              case 3:
                ctx.translate(canvas.width, canvas.height);
                ctx.rotate(Math.PI);
                break;
              case 4:
                ctx.translate(0, canvas.height);
                ctx.scale(1, -1);
                break;
              case 5:
                ctx.rotate(0.5 * Math.PI);
                ctx.scale(1, -1);
                break;
              case 6:
                ctx.rotate(0.5 * Math.PI);
                ctx.translate(0, -canvas.height);
                break;
              case 7:
                ctx.rotate(0.5 * Math.PI);
                ctx.translate(canvas.width, -canvas.height);
                ctx.scale(-1, 1);
                break;
              case 8:
                ctx.rotate(-0.5 * Math.PI);
                ctx.translate(-canvas.width, 0);
            }
            drawImageIOSFix(ctx, img, (ref = resizeInfo.srcX) != null ? ref : 0, (ref1 = resizeInfo.srcY) != null ? ref1 : 0, resizeInfo.srcWidth, resizeInfo.srcHeight, (ref2 = resizeInfo.trgX) != null ? ref2 : 0, (ref3 = resizeInfo.trgY) != null ? ref3 : 0, resizeInfo.trgWidth, resizeInfo.trgHeight);
            thumbnail = canvas.toDataURL("image/png");
            if (callback != null) {
              return callback(thumbnail, canvas);
            }
          });
        };
      })(this);
      if (callback != null) {
        img.onerror = callback;
      }
      return img.src = file.dataURL;
    };

    Dropzone.prototype.processQueue = function() {
      var i, parallelUploads, processingLength, queuedFiles;
      parallelUploads = this.options.parallelUploads;
      processingLength = this.getUploadingFiles().length;
      i = processingLength;
      if (processingLength >= parallelUploads) {
        return;
      }
      queuedFiles = this.getQueuedFiles();
      if (!(queuedFiles.length > 0)) {
        return;
      }
      if (this.options.uploadMultiple) {
        return this.processFiles(queuedFiles.slice(0, parallelUploads - processingLength));
      } else {
        while (i < parallelUploads) {
          if (!queuedFiles.length) {
            return;
          }
          this.processFile(queuedFiles.shift());
          i++;
        }
      }
    };

    Dropzone.prototype.processFile = function(file) {
      return this.processFiles([file]);
    };

    Dropzone.prototype.processFiles = function(files) {
      var file, j, len;
      for (j = 0, len = files.length; j < len; j++) {
        file = files[j];
        file.processing = true;
        file.status = Dropzone.UPLOADING;
        this.emit("processing", file);
      }
      if (this.options.uploadMultiple) {
        this.emit("processingmultiple", files);
      }
      return this.uploadFiles(files);
    };

    Dropzone.prototype._getFilesWithXhr = function(xhr) {
      var file, files;
      return files = (function() {
        var j, len, ref, results;
        ref = this.files;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          file = ref[j];
          if (file.xhr === xhr) {
            results.push(file);
          }
        }
        return results;
      }).call(this);
    };

    Dropzone.prototype.cancelUpload = function(file) {
      var groupedFile, groupedFiles, j, k, len, len1, ref;
      if (file.status === Dropzone.UPLOADING) {
        groupedFiles = this._getFilesWithXhr(file.xhr);
        for (j = 0, len = groupedFiles.length; j < len; j++) {
          groupedFile = groupedFiles[j];
          groupedFile.status = Dropzone.CANCELED;
        }
        file.xhr.abort();
        for (k = 0, len1 = groupedFiles.length; k < len1; k++) {
          groupedFile = groupedFiles[k];
          this.emit("canceled", groupedFile);
        }
        if (this.options.uploadMultiple) {
          this.emit("canceledmultiple", groupedFiles);
        }
      } else if ((ref = file.status) === Dropzone.ADDED || ref === Dropzone.QUEUED) {
        file.status = Dropzone.CANCELED;
        this.emit("canceled", file);
        if (this.options.uploadMultiple) {
          this.emit("canceledmultiple", [file]);
        }
      }
      if (this.options.autoProcessQueue) {
        return this.processQueue();
      }
    };

    resolveOption = function() {
      var args, option;
      option = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      if (typeof option === 'function') {
        return option.apply(this, args);
      }
      return option;
    };

    Dropzone.prototype.uploadFile = function(file) {
      return this.uploadFiles([file]);
    };

    Dropzone.prototype.uploadFiles = function(files) {
      var doneCounter, doneFunction, file, formData, handleError, headerName, headerValue, headers, i, input, inputName, inputType, j, k, key, l, len, len1, len2, len3, m, method, o, option, progressObj, ref, ref1, ref2, ref3, ref4, ref5, response, results, updateProgress, url, value, xhr;
      xhr = new XMLHttpRequest();
      for (j = 0, len = files.length; j < len; j++) {
        file = files[j];
        file.xhr = xhr;
      }
      method = resolveOption(this.options.method, files);
      url = resolveOption(this.options.url, files);
      xhr.open(method, url, true);
      xhr.timeout = resolveOption(this.options.timeout, files);
      xhr.withCredentials = !!this.options.withCredentials;
      response = null;
      handleError = (function(_this) {
        return function() {
          var k, len1, results;
          results = [];
          for (k = 0, len1 = files.length; k < len1; k++) {
            file = files[k];
            results.push(_this._errorProcessing(files, response || _this.options.dictResponseError.replace("{{statusCode}}", xhr.status), xhr));
          }
          return results;
        };
      })(this);
      updateProgress = (function(_this) {
        return function(e) {
          var allFilesFinished, k, l, len1, len2, len3, m, progress, results;
          if (e != null) {
            progress = 100 * e.loaded / e.total;
            for (k = 0, len1 = files.length; k < len1; k++) {
              file = files[k];
              file.upload = {
                progress: progress,
                total: e.total,
                bytesSent: e.loaded
              };
            }
          } else {
            allFilesFinished = true;
            progress = 100;
            for (l = 0, len2 = files.length; l < len2; l++) {
              file = files[l];
              if (!(file.upload.progress === 100 && file.upload.bytesSent === file.upload.total)) {
                allFilesFinished = false;
              }
              file.upload.progress = progress;
              file.upload.bytesSent = file.upload.total;
            }
            if (allFilesFinished) {
              return;
            }
          }
          results = [];
          for (m = 0, len3 = files.length; m < len3; m++) {
            file = files[m];
            results.push(_this.emit("uploadprogress", file, progress, file.upload.bytesSent));
          }
          return results;
        };
      })(this);
      xhr.onload = (function(_this) {
        return function(e) {
          var error1, ref;
          if (files[0].status === Dropzone.CANCELED) {
            return;
          }
          if (xhr.readyState !== 4) {
            return;
          }
          response = xhr.responseText;
          if (xhr.getResponseHeader("content-type") && ~xhr.getResponseHeader("content-type").indexOf("application/json")) {
            try {
              response = JSON.parse(response);
            } catch (error1) {
              e = error1;
              response = "Invalid JSON response from server.";
            }
          }
          updateProgress();
          if (!((200 <= (ref = xhr.status) && ref < 300))) {
            return handleError();
          } else {
            return _this._finished(files, response, e);
          }
        };
      })(this);
      xhr.onerror = (function(_this) {
        return function() {
          if (files[0].status === Dropzone.CANCELED) {
            return;
          }
          return handleError();
        };
      })(this);
      progressObj = (ref = xhr.upload) != null ? ref : xhr;
      progressObj.onprogress = updateProgress;
      headers = {
        "Accept": "application/json",
        "Cache-Control": "no-cache",
        "X-Requested-With": "XMLHttpRequest"
      };
      if (this.options.headers) {
        extend(headers, this.options.headers);
      }
      for (headerName in headers) {
        headerValue = headers[headerName];
        if (headerValue) {
          xhr.setRequestHeader(headerName, headerValue);
        }
      }
      formData = new FormData();
      if (this.options.params) {
        ref1 = this.options.params;
        for (key in ref1) {
          value = ref1[key];
          formData.append(key, value);
        }
      }
      for (k = 0, len1 = files.length; k < len1; k++) {
        file = files[k];
        this.emit("sending", file, xhr, formData);
      }
      if (this.options.uploadMultiple) {
        this.emit("sendingmultiple", files, xhr, formData);
      }
      if (this.element.tagName === "FORM") {
        ref2 = this.element.querySelectorAll("input, textarea, select, button");
        for (l = 0, len2 = ref2.length; l < len2; l++) {
          input = ref2[l];
          inputName = input.getAttribute("name");
          inputType = input.getAttribute("type");
          if (input.tagName === "SELECT" && input.hasAttribute("multiple")) {
            ref3 = input.options;
            for (m = 0, len3 = ref3.length; m < len3; m++) {
              option = ref3[m];
              if (option.selected) {
                formData.append(inputName, option.value);
              }
            }
          } else if (!inputType || ((ref4 = inputType.toLowerCase()) !== "checkbox" && ref4 !== "radio") || input.checked) {
            formData.append(inputName, input.value);
          }
        }
      }
      doneCounter = 0;
      results = [];
      for (i = o = 0, ref5 = files.length - 1; 0 <= ref5 ? o <= ref5 : o >= ref5; i = 0 <= ref5 ? ++o : --o) {
        doneFunction = (function(_this) {
          return function(file, paramName, fileName) {
            return function(transformedFile) {
              formData.append(paramName, transformedFile, fileName);
              if (++doneCounter === files.length) {
                return _this.submitRequest(xhr, formData, files);
              }
            };
          };
        })(this);
        results.push(this.options.transformFile.call(this, files[i], doneFunction(files[i], this._getParamName(i), files[i].upload.filename)));
      }
      return results;
    };

    Dropzone.prototype.submitRequest = function(xhr, formData, files) {
      return xhr.send(formData);
    };

    Dropzone.prototype._finished = function(files, responseText, e) {
      var file, j, len;
      for (j = 0, len = files.length; j < len; j++) {
        file = files[j];
        file.status = Dropzone.SUCCESS;
        this.emit("success", file, responseText, e);
        this.emit("complete", file);
      }
      if (this.options.uploadMultiple) {
        this.emit("successmultiple", files, responseText, e);
        this.emit("completemultiple", files);
      }
      if (this.options.autoProcessQueue) {
        return this.processQueue();
      }
    };

    Dropzone.prototype._errorProcessing = function(files, message, xhr) {
      var file, j, len;
      for (j = 0, len = files.length; j < len; j++) {
        file = files[j];
        file.status = Dropzone.ERROR;
        this.emit("error", file, message, xhr);
        this.emit("complete", file);
      }
      if (this.options.uploadMultiple) {
        this.emit("errormultiple", files, message, xhr);
        this.emit("completemultiple", files);
      }
      if (this.options.autoProcessQueue) {
        return this.processQueue();
      }
    };

    return Dropzone;

  })(Emitter);

  Dropzone.version = "5.1.0";

  Dropzone.options = {};

  Dropzone.optionsForElement = function(element) {
    if (element.getAttribute("id")) {
      return Dropzone.options[camelize(element.getAttribute("id"))];
    } else {
      return void 0;
    }
  };

  Dropzone.instances = [];

  Dropzone.forElement = function(element) {
    if (typeof element === "string") {
      element = document.querySelector(element);
    }
    if ((element != null ? element.dropzone : void 0) == null) {
      throw new Error("No Dropzone found for given element. This is probably because you're trying to access it before Dropzone had the time to initialize. Use the `init` option to setup any additional observers on your Dropzone.");
    }
    return element.dropzone;
  };

  Dropzone.autoDiscover = true;

  Dropzone.discover = function() {
    var checkElements, dropzone, dropzones, j, len, results;
    if (document.querySelectorAll) {
      dropzones = document.querySelectorAll(".dropzone");
    } else {
      dropzones = [];
      checkElements = function(elements) {
        var el, j, len, results;
        results = [];
        for (j = 0, len = elements.length; j < len; j++) {
          el = elements[j];
          if (/(^| )dropzone($| )/.test(el.className)) {
            results.push(dropzones.push(el));
          } else {
            results.push(void 0);
          }
        }
        return results;
      };
      checkElements(document.getElementsByTagName("div"));
      checkElements(document.getElementsByTagName("form"));
    }
    results = [];
    for (j = 0, len = dropzones.length; j < len; j++) {
      dropzone = dropzones[j];
      if (Dropzone.optionsForElement(dropzone) !== false) {
        results.push(new Dropzone(dropzone));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Dropzone.blacklistedBrowsers = [/opera.*Macintosh.*version\/12/i];

  Dropzone.isBrowserSupported = function() {
    var capableBrowser, j, len, ref, regex;
    capableBrowser = true;
    if (window.File && window.FileReader && window.FileList && window.Blob && window.FormData && document.querySelector) {
      if (!("classList" in document.createElement("a"))) {
        capableBrowser = false;
      } else {
        ref = Dropzone.blacklistedBrowsers;
        for (j = 0, len = ref.length; j < len; j++) {
          regex = ref[j];
          if (regex.test(navigator.userAgent)) {
            capableBrowser = false;
            continue;
          }
        }
      }
    } else {
      capableBrowser = false;
    }
    return capableBrowser;
  };

  Dropzone.dataURItoBlob = function(dataURI) {
    var ab, byteString, i, ia, j, mimeString, ref;
    byteString = atob(dataURI.split(',')[1]);
    mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    ab = new ArrayBuffer(byteString.length);
    ia = new Uint8Array(ab);
    for (i = j = 0, ref = byteString.length; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {
      type: mimeString
    });
  };

  without = function(list, rejectedItem) {
    var item, j, len, results;
    results = [];
    for (j = 0, len = list.length; j < len; j++) {
      item = list[j];
      if (item !== rejectedItem) {
        results.push(item);
      }
    }
    return results;
  };

  camelize = function(str) {
    return str.replace(/[\-_](\w)/g, function(match) {
      return match.charAt(1).toUpperCase();
    });
  };

  Dropzone.createElement = function(string) {
    var div;
    div = document.createElement("div");
    div.innerHTML = string;
    return div.childNodes[0];
  };

  Dropzone.elementInside = function(element, container) {
    if (element === container) {
      return true;
    }
    while (element = element.parentNode) {
      if (element === container) {
        return true;
      }
    }
    return false;
  };

  Dropzone.getElement = function(el, name) {
    var element;
    if (typeof el === "string") {
      element = document.querySelector(el);
    } else if (el.nodeType != null) {
      element = el;
    }
    if (element == null) {
      throw new Error("Invalid `" + name + "` option provided. Please provide a CSS selector or a plain HTML element.");
    }
    return element;
  };

  Dropzone.getElements = function(els, name) {
    var e, el, elements, error1, j, k, len, len1, ref;
    if (els instanceof Array) {
      elements = [];
      try {
        for (j = 0, len = els.length; j < len; j++) {
          el = els[j];
          elements.push(this.getElement(el, name));
        }
      } catch (error1) {
        e = error1;
        elements = null;
      }
    } else if (typeof els === "string") {
      elements = [];
      ref = document.querySelectorAll(els);
      for (k = 0, len1 = ref.length; k < len1; k++) {
        el = ref[k];
        elements.push(el);
      }
    } else if (els.nodeType != null) {
      elements = [els];
    }
    if (!((elements != null) && elements.length)) {
      throw new Error("Invalid `" + name + "` option provided. Please provide a CSS selector, a plain HTML element or a list of those.");
    }
    return elements;
  };

  Dropzone.confirm = function(question, accepted, rejected) {
    if (window.confirm(question)) {
      return accepted();
    } else if (rejected != null) {
      return rejected();
    }
  };

  Dropzone.isValidFile = function(file, acceptedFiles) {
    var baseMimeType, j, len, mimeType, validType;
    if (!acceptedFiles) {
      return true;
    }
    acceptedFiles = acceptedFiles.split(",");
    mimeType = file.type;
    baseMimeType = mimeType.replace(/\/.*$/, "");
    for (j = 0, len = acceptedFiles.length; j < len; j++) {
      validType = acceptedFiles[j];
      validType = validType.trim();
      if (validType.charAt(0) === ".") {
        if (file.name.toLowerCase().indexOf(validType.toLowerCase(), file.name.length - validType.length) !== -1) {
          return true;
        }
      } else if (/\/\*$/.test(validType)) {
        if (baseMimeType === validType.replace(/\/.*$/, "")) {
          return true;
        }
      } else {
        if (mimeType === validType) {
          return true;
        }
      }
    }
    return false;
  };

  if (typeof jQuery !== "undefined" && jQuery !== null) {
    jQuery.fn.dropzone = function(options) {
      return this.each(function() {
        return new Dropzone(this, options);
      });
    };
  }

  if (typeof module !== "undefined" && module !== null) {
    module.exports = Dropzone;
  } else {
    window.Dropzone = Dropzone;
  }

  Dropzone.ADDED = "added";

  Dropzone.QUEUED = "queued";

  Dropzone.ACCEPTED = Dropzone.QUEUED;

  Dropzone.UPLOADING = "uploading";

  Dropzone.PROCESSING = Dropzone.UPLOADING;

  Dropzone.CANCELED = "canceled";

  Dropzone.ERROR = "error";

  Dropzone.SUCCESS = "success";


  /*
  
  Bugfix for iOS 6 and 7
  Source: http://stackoverflow.com/questions/11929099/html5-canvas-drawimage-ratio-bug-ios
  based on the work of https://github.com/stomita/ios-imagefile-megapixel
   */

  detectVerticalSquash = function(img) {
    var alpha, canvas, ctx, data, ey, ih, iw, py, ratio, sy;
    iw = img.naturalWidth;
    ih = img.naturalHeight;
    canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = ih;
    ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    data = ctx.getImageData(1, 0, 1, ih).data;
    sy = 0;
    ey = ih;
    py = ih;
    while (py > sy) {
      alpha = data[(py - 1) * 4 + 3];
      if (alpha === 0) {
        ey = py;
      } else {
        sy = py;
      }
      py = (ey + sy) >> 1;
    }
    ratio = py / ih;
    if (ratio === 0) {
      return 1;
    } else {
      return ratio;
    }
  };

  drawImageIOSFix = function(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
    var vertSquashRatio;
    vertSquashRatio = detectVerticalSquash(img);
    return ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh / vertSquashRatio);
  };

  ExifRestore = (function() {
    function ExifRestore() {}

    ExifRestore.KEY_STR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    ExifRestore.encode64 = function(input) {
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4, i, output;
      output = '';
      chr1 = void 0;
      chr2 = void 0;
      chr3 = '';
      enc1 = void 0;
      enc2 = void 0;
      enc3 = void 0;
      enc4 = '';
      i = 0;
      while (true) {
        chr1 = input[i++];
        chr2 = input[i++];
        chr3 = input[i++];
        enc1 = chr1 >> 2;
        enc2 = (chr1 & 3) << 4 | chr2 >> 4;
        enc3 = (chr2 & 15) << 2 | chr3 >> 6;
        enc4 = chr3 & 63;
        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }
        output = output + this.KEY_STR.charAt(enc1) + this.KEY_STR.charAt(enc2) + this.KEY_STR.charAt(enc3) + this.KEY_STR.charAt(enc4);
        chr1 = chr2 = chr3 = '';
        enc1 = enc2 = enc3 = enc4 = '';
        if (!(i < input.length)) {
          break;
        }
      }
      return output;
    };

    ExifRestore.restore = function(origFileBase64, resizedFileBase64) {
      var image, rawImage, segments;
      if (!origFileBase64.match('data:image/jpeg;base64,')) {
        return resizedFileBase64;
      }
      rawImage = this.decode64(origFileBase64.replace('data:image/jpeg;base64,', ''));
      segments = this.slice2Segments(rawImage);
      image = this.exifManipulation(resizedFileBase64, segments);
      return 'data:image/jpeg;base64,' + this.encode64(image);
    };

    ExifRestore.exifManipulation = function(resizedFileBase64, segments) {
      var aBuffer, exifArray, newImageArray;
      exifArray = this.getExifArray(segments);
      newImageArray = this.insertExif(resizedFileBase64, exifArray);
      aBuffer = new Uint8Array(newImageArray);
      return aBuffer;
    };

    ExifRestore.getExifArray = function(segments) {
      var seg, x;
      seg = void 0;
      x = 0;
      while (x < segments.length) {
        seg = segments[x];
        if (seg[0] === 255 & seg[1] === 225) {
          return seg;
        }
        x++;
      }
      return [];
    };

    ExifRestore.insertExif = function(resizedFileBase64, exifArray) {
      var array, ato, buf, imageData, mae, separatePoint;
      imageData = resizedFileBase64.replace('data:image/jpeg;base64,', '');
      buf = this.decode64(imageData);
      separatePoint = buf.indexOf(255, 3);
      mae = buf.slice(0, separatePoint);
      ato = buf.slice(separatePoint);
      array = mae;
      array = array.concat(exifArray);
      array = array.concat(ato);
      return array;
    };

    ExifRestore.slice2Segments = function(rawImageArray) {
      var endPoint, head, length, seg, segments;
      head = 0;
      segments = [];
      while (true) {
        if (rawImageArray[head] === 255 & rawImageArray[head + 1] === 218) {
          break;
        }
        if (rawImageArray[head] === 255 & rawImageArray[head + 1] === 216) {
          head += 2;
        } else {
          length = rawImageArray[head + 2] * 256 + rawImageArray[head + 3];
          endPoint = head + length + 2;
          seg = rawImageArray.slice(head, endPoint);
          segments.push(seg);
          head = endPoint;
        }
        if (head > rawImageArray.length) {
          break;
        }
      }
      return segments;
    };

    ExifRestore.decode64 = function(input) {
      var base64test, buf, chr1, chr2, chr3, enc1, enc2, enc3, enc4, i, output;
      output = '';
      chr1 = void 0;
      chr2 = void 0;
      chr3 = '';
      enc1 = void 0;
      enc2 = void 0;
      enc3 = void 0;
      enc4 = '';
      i = 0;
      buf = [];
      base64test = /[^A-Za-z0-9\+\/\=]/g;
      if (base64test.exec(input)) {
        console.warning('There were invalid base64 characters in the input text.\n' + 'Valid base64 characters are A-Z, a-z, 0-9, \'+\', \'/\',and \'=\'\n' + 'Expect errors in decoding.');
      }
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
      while (true) {
        enc1 = this.KEY_STR.indexOf(input.charAt(i++));
        enc2 = this.KEY_STR.indexOf(input.charAt(i++));
        enc3 = this.KEY_STR.indexOf(input.charAt(i++));
        enc4 = this.KEY_STR.indexOf(input.charAt(i++));
        chr1 = enc1 << 2 | enc2 >> 4;
        chr2 = (enc2 & 15) << 4 | enc3 >> 2;
        chr3 = (enc3 & 3) << 6 | enc4;
        buf.push(chr1);
        if (enc3 !== 64) {
          buf.push(chr2);
        }
        if (enc4 !== 64) {
          buf.push(chr3);
        }
        chr1 = chr2 = chr3 = '';
        enc1 = enc2 = enc3 = enc4 = '';
        if (!(i < input.length)) {
          break;
        }
      }
      return buf;
    };

    return ExifRestore;

  })();


  /*
   * contentloaded.js
   *
   * Author: Diego Perini (diego.perini at gmail.com)
   * Summary: cross-browser wrapper for DOMContentLoaded
   * Updated: 20101020
   * License: MIT
   * Version: 1.2
   *
   * URL:
   * http://javascript.nwbox.com/ContentLoaded/
   * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
   */

  contentLoaded = function(win, fn) {
    var add, doc, done, init, poll, pre, rem, root, top;
    done = false;
    top = true;
    doc = win.document;
    root = doc.documentElement;
    add = (doc.addEventListener ? "addEventListener" : "attachEvent");
    rem = (doc.addEventListener ? "removeEventListener" : "detachEvent");
    pre = (doc.addEventListener ? "" : "on");
    init = function(e) {
      if (e.type === "readystatechange" && doc.readyState !== "complete") {
        return;
      }
      (e.type === "load" ? win : doc)[rem](pre + e.type, init, false);
      if (!done && (done = true)) {
        return fn.call(win, e.type || e);
      }
    };
    poll = function() {
      var e, error1;
      try {
        root.doScroll("left");
      } catch (error1) {
        e = error1;
        setTimeout(poll, 50);
        return;
      }
      return init("poll");
    };
    if (doc.readyState !== "complete") {
      if (doc.createEventObject && root.doScroll) {
        try {
          top = !win.frameElement;
        } catch (undefined) {}
        if (top) {
          poll();
        }
      }
      doc[add](pre + "DOMContentLoaded", init, false);
      doc[add](pre + "readystatechange", init, false);
      return win[add](pre + "load", init, false);
    }
  };

  Dropzone._autoDiscoverFunction = function() {
    if (Dropzone.autoDiscover) {
      return Dropzone.discover();
    }
  };

  contentLoaded(window, Dropzone._autoDiscoverFunction);

}).call(this);

!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.Sweetalert2=t()}(this,function(){"use strict";var e={title:"",titleText:"",text:"",html:"",type:null,customClass:"",target:"body",animation:!0,allowOutsideClick:!0,allowEscapeKey:!0,allowEnterKey:!0,showConfirmButton:!0,showCancelButton:!1,preConfirm:null,confirmButtonText:"OK",confirmButtonColor:"#3085d6",confirmButtonClass:null,cancelButtonText:"Cancel",cancelButtonColor:"#aaa",cancelButtonClass:null,buttonsStyling:!0,reverseButtons:!1,focusCancel:!1,showCloseButton:!1,showLoaderOnConfirm:!1,imageUrl:null,imageWidth:null,imageHeight:null,imageClass:null,timer:null,width:500,padding:20,background:"#fff",input:null,inputPlaceholder:"",inputValue:"",inputOptions:{},inputAutoTrim:!0,inputClass:null,inputAttributes:{},inputValidator:null,progressSteps:[],currentProgressStep:null,progressStepsDistance:"40px",onOpen:null,onClose:null,useRejections:!0},t=function(e){var t={};for(var n in e)t[e[n]]="swal2-"+e[n];return t},n=t(["container","shown","iosfix","modal","overlay","fade","show","hide","noanimation","close","title","content","buttonswrapper","confirm","cancel","icon","image","input","file","range","select","radio","checkbox","textarea","inputerror","validationerror","progresssteps","activeprogressstep","progresscircle","progressline","loading","styled"]),o=t(["success","warning","info","question","error"]),r=function(e,t){(e=String(e).replace(/[^0-9a-f]/gi,"")).length<6&&(e=e[0]+e[0]+e[1]+e[1]+e[2]+e[2]),t=t||0;for(var n="#",o=0;o<3;o++){var r=parseInt(e.substr(2*o,2),16);n+=("00"+(r=Math.round(Math.min(Math.max(0,r+r*t),255)).toString(16))).substr(r.length)}return n},i=function(e){var t=[];for(var n in e)-1===t.indexOf(e[n])&&t.push(e[n]);return t},a={previousWindowKeyDown:null,previousActiveElement:null,previousBodyPadding:null},l=function(e){var t=u();t&&t.parentNode.removeChild(t);{if("undefined"!=typeof document){var o=document.createElement("div");o.className=n.container,o.innerHTML=s,("string"==typeof e.target?document.querySelector(e.target):e.target).appendChild(o);var r=c(),i=A(r,n.input),a=A(r,n.file),l=r.querySelector("."+n.range+" input"),d=r.querySelector("."+n.range+" output"),p=A(r,n.select),f=r.querySelector("."+n.checkbox+" input"),m=A(r,n.textarea);return i.oninput=function(){$.resetValidationError()},i.onkeydown=function(t){setTimeout(function(){13===t.keyCode&&e.allowEnterKey&&(t.stopPropagation(),$.clickConfirm())},0)},a.onchange=function(){$.resetValidationError()},l.oninput=function(){$.resetValidationError(),d.value=l.value},l.onchange=function(){$.resetValidationError(),l.previousSibling.value=l.value},p.onchange=function(){$.resetValidationError()},f.onchange=function(){$.resetValidationError()},m.oninput=function(){$.resetValidationError()},r}console.error("SweetAlert2 requires document to initialize")}},s=('\n <div role="dialog" aria-labelledby="'+n.title+'" aria-describedby="'+n.content+'" class="'+n.modal+'" tabindex="-1">\n   <ul class="'+n.progresssteps+'"></ul>\n   <div class="'+n.icon+" "+o.error+'">\n     <span class="swal2-x-mark"><span class="swal2-x-mark-line-left"></span><span class="swal2-x-mark-line-right"></span></span>\n   </div>\n   <div class="'+n.icon+" "+o.question+'">?</div>\n   <div class="'+n.icon+" "+o.warning+'">!</div>\n   <div class="'+n.icon+" "+o.info+'">i</div>\n   <div class="'+n.icon+" "+o.success+'">\n     <div class="swal2-success-circular-line-left"></div>\n     <span class="swal2-success-line-tip"></span> <span class="swal2-success-line-long"></span>\n     <div class="swal2-success-ring"></div> <div class="swal2-success-fix"></div>\n     <div class="swal2-success-circular-line-right"></div>\n   </div>\n   <img class="'+n.image+'" />\n   <h2 class="'+n.title+'" id="'+n.title+'"></h2>\n   <div id="'+n.content+'" class="'+n.content+'"></div>\n   <input class="'+n.input+'" />\n   <input type="file" class="'+n.file+'" />\n   <div class="'+n.range+'">\n     <output></output>\n     <input type="range" />\n   </div>\n   <select class="'+n.select+'"></select>\n   <div class="'+n.radio+'"></div>\n   <label for="'+n.checkbox+'" class="'+n.checkbox+'">\n     <input type="checkbox" />\n   </label>\n   <textarea class="'+n.textarea+'"></textarea>\n   <div class="'+n.validationerror+'"></div>\n   <div class="'+n.buttonswrapper+'">\n     <button type="button" class="'+n.confirm+'">OK</button>\n     <button type="button" class="'+n.cancel+'">Cancel</button>\n   </div>\n   <button type="button" class="'+n.close+'" aria-label="Close this dialog">×</button>\n </div>\n').replace(/(^|\n)\s*/g,""),u=function(){return document.body.querySelector("."+n.container)},c=function(){return u()?u().querySelector("."+n.modal):null},d=function(){return c().querySelectorAll("."+n.icon)},p=function(e){return u()?u().querySelector("."+e):null},f=function(){return p(n.title)},m=function(){return p(n.content)},v=function(){return p(n.image)},g=function(){return p(n.buttonswrapper)},h=function(){return p(n.progresssteps)},y=function(){return p(n.validationerror)},b=function(){return p(n.confirm)},w=function(){return p(n.cancel)},C=function(){return p(n.close)},k=function(e){var t=[b(),w()];e&&t.reverse();var n=t.concat(Array.prototype.slice.call(c().querySelectorAll('button, input:not([type=hidden]), textarea, select, a, *[tabindex]:not([tabindex="-1"])')));return i(n)},S=function(e,t){return!!e.classList&&e.classList.contains(t)},x=function(e){if(e.focus(),"file"!==e.type){var t=e.value;e.value="",e.value=t}},E=function(e,t){e&&t&&t.split(/\s+/).filter(Boolean).forEach(function(t){e.classList.add(t)})},B=function(e,t){e&&t&&t.split(/\s+/).filter(Boolean).forEach(function(t){e.classList.remove(t)})},A=function(e,t){for(var n=0;n<e.childNodes.length;n++)if(S(e.childNodes[n],t))return e.childNodes[n]},P=function(e,t){t||(t="block"),e.style.opacity="",e.style.display=t},T=function(e){e.style.opacity="",e.style.display="none"},L=function(e){for(;e.firstChild;)e.removeChild(e.firstChild)},q=function(e){return e.offsetWidth||e.offsetHeight||e.getClientRects().length},M=function(e,t){e.style.removeProperty?e.style.removeProperty(t):e.style.removeAttribute(t)},V=function(e){if(!q(e))return!1;if("function"==typeof MouseEvent){var t=new MouseEvent("click",{view:window,bubbles:!1,cancelable:!0});e.dispatchEvent(t)}else if(document.createEvent){var n=document.createEvent("MouseEvents");n.initEvent("click",!1,!1),e.dispatchEvent(n)}else document.createEventObject?e.fireEvent("onclick"):"function"==typeof e.onclick&&e.onclick()},O=function(){var e=document.createElement("div"),t={WebkitAnimation:"webkitAnimationEnd",OAnimation:"oAnimationEnd oanimationend",msAnimation:"MSAnimationEnd",animation:"animationend"};for(var n in t)if(t.hasOwnProperty(n)&&void 0!==e.style[n])return t[n];return!1}(),H=function(){if(window.onkeydown=a.previousWindowKeyDown,a.previousActiveElement&&a.previousActiveElement.focus){var e=window.scrollX,t=window.scrollY;a.previousActiveElement.focus(),e&&t&&window.scrollTo(e,t)}},N=function(){if("ontouchstart"in window||navigator.msMaxTouchPoints)return 0;var e=document.createElement("div");e.style.width="50px",e.style.height="50px",e.style.overflow="scroll",document.body.appendChild(e);var t=e.offsetWidth-e.clientWidth;return document.body.removeChild(e),t},j=function(e,t){var n=void 0;return function(){clearTimeout(n),n=setTimeout(function(){n=null,e()},t)}},R="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},I=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(e[o]=n[o])}return e},K=I({},e),D=[],W=void 0,U=function(t){("string"==typeof t.target&&!document.querySelector(t.target)||"string"!=typeof t.target&&!t.target.appendChild)&&(console.warn('SweetAlert2: Target parameter is not valid, defaulting to "body"'),t.target="body");var r=void 0,i=c(),a="string"==typeof t.target?document.querySelector(t.target):t.target;r=i&&a&&i.parentNode!==a.parentNode?l(t):i||l(t);for(var s in t)e.hasOwnProperty(s)||"extraParams"===s||console.warn('SweetAlert2: Unknown parameter "'+s+'"');r.style.width="number"==typeof t.width?t.width+"px":t.width,r.style.padding=t.padding+"px",r.style.background=t.background;for(var u=r.querySelectorAll("[class^=swal2-success-circular-line], .swal2-success-fix"),p=0;p<u.length;p++)u[p].style.background=t.background;var y=f(),k=m(),S=g(),x=b(),A=w(),q=C();if(t.titleText?y.innerText=t.titleText:y.innerHTML=t.title.split("\n").join("<br />"),t.text||t.html){if("object"===R(t.html))if(k.innerHTML="",0 in t.html)for(var V=0;V in t.html;V++)k.appendChild(t.html[V].cloneNode(!0));else k.appendChild(t.html.cloneNode(!0));else t.html?k.innerHTML=t.html:t.text&&(k.textContent=t.text);P(k)}else T(k);t.showCloseButton?P(q):T(q),r.className=n.modal,t.customClass&&E(r,t.customClass);var O=h(),H=parseInt(null===t.currentProgressStep?$.getQueueStep():t.currentProgressStep,10);t.progressSteps.length?(P(O),L(O),H>=t.progressSteps.length&&console.warn("SweetAlert2: Invalid currentProgressStep parameter, it should be less than progressSteps.length (currentProgressStep like JS arrays starts from 0)"),t.progressSteps.forEach(function(e,o){var r=document.createElement("li");if(E(r,n.progresscircle),r.innerHTML=e,o===H&&E(r,n.activeprogressstep),O.appendChild(r),o!==t.progressSteps.length-1){var i=document.createElement("li");E(i,n.progressline),i.style.width=t.progressStepsDistance,O.appendChild(i)}})):T(O);for(var N=d(),j=0;j<N.length;j++)T(N[j]);if(t.type){var I=!1;for(var K in o)if(t.type===K){I=!0;break}if(!I)return console.error("SweetAlert2: Unknown alert type: "+t.type),!1;var D=r.querySelector("."+n.icon+"."+o[t.type]);if(P(D),t.animation)switch(t.type){case"success":E(D,"swal2-animate-success-icon"),E(D.querySelector(".swal2-success-line-tip"),"swal2-animate-success-line-tip"),E(D.querySelector(".swal2-success-line-long"),"swal2-animate-success-line-long");break;case"error":E(D,"swal2-animate-error-icon"),E(D.querySelector(".swal2-x-mark"),"swal2-animate-x-mark")}}var W=v();t.imageUrl?(W.setAttribute("src",t.imageUrl),P(W),t.imageWidth?W.setAttribute("width",t.imageWidth):W.removeAttribute("width"),t.imageHeight?W.setAttribute("height",t.imageHeight):W.removeAttribute("height"),W.className=n.image,t.imageClass&&E(W,t.imageClass)):T(W),t.showCancelButton?A.style.display="inline-block":T(A),t.showConfirmButton?M(x,"display"):T(x),t.showConfirmButton||t.showCancelButton?P(S):T(S),x.innerHTML=t.confirmButtonText,A.innerHTML=t.cancelButtonText,t.buttonsStyling&&(x.style.backgroundColor=t.confirmButtonColor,A.style.backgroundColor=t.cancelButtonColor),x.className=n.confirm,E(x,t.confirmButtonClass),A.className=n.cancel,E(A,t.cancelButtonClass),t.buttonsStyling?(E(x,n.styled),E(A,n.styled)):(B(x,n.styled),B(A,n.styled),x.style.backgroundColor=x.style.borderLeftColor=x.style.borderRightColor="",A.style.backgroundColor=A.style.borderLeftColor=A.style.borderRightColor=""),!0===t.animation?B(r,n.noanimation):E(r,n.noanimation)},z=function(e,t){var o=u(),r=c();e?(E(r,n.show),E(o,n.fade),B(r,n.hide)):B(r,n.fade),P(r),o.style.overflowY="hidden",O&&!S(r,n.noanimation)?r.addEventListener(O,function e(){r.removeEventListener(O,e),o.style.overflowY="auto"}):o.style.overflowY="auto",E(document.documentElement,n.shown),E(document.body,n.shown),E(o,n.shown),Z(),Y(),a.previousActiveElement=document.activeElement,null!==t&&"function"==typeof t&&setTimeout(function(){t(r)})},Z=function(){null===a.previousBodyPadding&&document.body.scrollHeight>window.innerHeight&&(a.previousBodyPadding=document.body.style.paddingRight,document.body.style.paddingRight=N()+"px")},Q=function(){null!==a.previousBodyPadding&&(document.body.style.paddingRight=a.previousBodyPadding,a.previousBodyPadding=null)},Y=function(){if(/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream&&!S(document.body,n.iosfix)){var e=document.body.scrollTop;document.body.style.top=-1*e+"px",E(document.body,n.iosfix)}},_=function(){if(S(document.body,n.iosfix)){var e=parseInt(document.body.style.top,10);B(document.body,n.iosfix),document.body.style.top="",document.body.scrollTop=-1*e}},$=function e(){for(var t=arguments.length,o=Array(t),i=0;i<t;i++)o[i]=arguments[i];if(void 0===o[0])return console.error("SweetAlert2 expects at least 1 attribute!"),!1;var l=I({},K);switch(R(o[0])){case"string":l.title=o[0],l.html=o[1],l.type=o[2];break;case"object":I(l,o[0]),l.extraParams=o[0].extraParams,"email"===l.input&&null===l.inputValidator&&(l.inputValidator=function(e){return new Promise(function(t,n){/^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(e)?t():n("Invalid email address")})}),"url"===l.input&&null===l.inputValidator&&(l.inputValidator=function(e){return new Promise(function(t,n){/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/.test(e)?t():n("Invalid URL")})});break;default:return console.error('SweetAlert2: Unexpected type of argument! Expected "string" or "object", got '+R(o[0])),!1}U(l);var s=u(),d=c();return new Promise(function(t,o){l.timer&&(d.timeout=setTimeout(function(){e.closeModal(l.onClose),l.useRejections?o("timer"):t({dismiss:"timer"})},l.timer));var i=function(e){if(!(e=e||l.input))return null;switch(e){case"select":case"textarea":case"file":return A(d,n[e]);case"checkbox":return d.querySelector("."+n.checkbox+" input");case"radio":return d.querySelector("."+n.radio+" input:checked")||d.querySelector("."+n.radio+" input:first-child");case"range":return d.querySelector("."+n.range+" input");default:return A(d,n.input)}},p=function(){var e=i();if(!e)return null;switch(l.input){case"checkbox":return e.checked?1:0;case"radio":return e.checked?e.value:null;case"file":return e.files.length?e.files[0]:null;default:return l.inputAutoTrim?e.value.trim():e.value}};l.input&&setTimeout(function(){var e=i();e&&x(e)},0);for(var S=function(n){l.showLoaderOnConfirm&&e.showLoading(),l.preConfirm?l.preConfirm(n,l.extraParams).then(function(o){e.closeModal(l.onClose),t(o||n)},function(t){e.hideLoading(),t&&e.showValidationError(t)}):(e.closeModal(l.onClose),t(l.useRejections?n:{value:n}))},L=function(n){var i=n||window.event,a=i.target||i.srcElement,s=b(),u=w(),c=s&&(s===a||s.contains(a)),d=u&&(u===a||u.contains(a));switch(i.type){case"mouseover":case"mouseup":l.buttonsStyling&&(c?s.style.backgroundColor=r(l.confirmButtonColor,-.1):d&&(u.style.backgroundColor=r(l.cancelButtonColor,-.1)));break;case"mouseout":l.buttonsStyling&&(c?s.style.backgroundColor=l.confirmButtonColor:d&&(u.style.backgroundColor=l.cancelButtonColor));break;case"mousedown":l.buttonsStyling&&(c?s.style.backgroundColor=r(l.confirmButtonColor,-.2):d&&(u.style.backgroundColor=r(l.cancelButtonColor,-.2)));break;case"click":if(c&&e.isVisible())if(e.disableButtons(),l.input){var f=p();l.inputValidator?(e.disableInput(),l.inputValidator(f,l.extraParams).then(function(){e.enableButtons(),e.enableInput(),S(f)},function(t){e.enableButtons(),e.enableInput(),t&&e.showValidationError(t)})):S(f)}else S(!0);else d&&e.isVisible()&&(e.disableButtons(),e.closeModal(l.onClose),l.useRejections?o("cancel"):t({dismiss:"cancel"}))}},M=d.querySelectorAll("button"),O=0;O<M.length;O++)M[O].onclick=L,M[O].onmouseover=L,M[O].onmouseout=L,M[O].onmousedown=L;C().onclick=function(){e.closeModal(l.onClose),l.useRejections?o("close"):t({dismiss:"close"})},s.onclick=function(n){n.target===s&&l.allowOutsideClick&&(e.closeModal(l.onClose),l.useRejections?o("overlay"):t({dismiss:"overlay"}))};var H=g(),N=b(),I=w();l.reverseButtons?N.parentNode.insertBefore(I,N):N.parentNode.insertBefore(N,I);var K=function(e,t){for(var n=k(l.focusCancel),o=0;o<n.length;o++){(e+=t)===n.length?e=0:-1===e&&(e=n.length-1);var r=n[e];if(q(r))return r.focus()}},D=function(n){var r=n||window.event,i=r.keyCode||r.which;if(-1!==[9,13,32,27,37,38,39,40].indexOf(i)){for(var a=r.target||r.srcElement,s=k(l.focusCancel),u=-1,c=0;c<s.length;c++)if(a===s[c]){u=c;break}9===i?(r.shiftKey?K(u,-1):K(u,1),r.stopPropagation(),r.preventDefault()):37===i||38===i||39===i||40===i?document.activeElement===N&&q(I)?I.focus():document.activeElement===I&&q(N)&&N.focus():13===i||32===i?-1===u&&l.allowEnterKey&&(V(l.focusCancel?I:N),r.stopPropagation(),r.preventDefault()):27===i&&!0===l.allowEscapeKey&&(e.closeModal(l.onClose),l.useRejections?o("esc"):t({dismiss:"esc"}))}};window.onkeydown&&window.onkeydown.toString()===D.toString()||(a.previousWindowKeyDown=window.onkeydown,window.onkeydown=D),l.buttonsStyling&&(N.style.borderLeftColor=l.confirmButtonColor,N.style.borderRightColor=l.confirmButtonColor),e.hideLoading=e.disableLoading=function(){l.showConfirmButton||(T(N),l.showCancelButton||T(g())),B(H,n.loading),B(d,n.loading),N.disabled=!1,I.disabled=!1},e.getTitle=function(){return f()},e.getContent=function(){return m()},e.getInput=function(){return i()},e.getImage=function(){return v()},e.getButtonsWrapper=function(){return g()},e.getConfirmButton=function(){return b()},e.getCancelButton=function(){return w()},e.enableButtons=function(){N.disabled=!1,I.disabled=!1},e.disableButtons=function(){N.disabled=!0,I.disabled=!0},e.enableConfirmButton=function(){N.disabled=!1},e.disableConfirmButton=function(){N.disabled=!0},e.enableInput=function(){var e=i();if(!e)return!1;if("radio"===e.type)for(var t=e.parentNode.parentNode.querySelectorAll("input"),n=0;n<t.length;n++)t[n].disabled=!1;else e.disabled=!1},e.disableInput=function(){var e=i();if(!e)return!1;if(e&&"radio"===e.type)for(var t=e.parentNode.parentNode.querySelectorAll("input"),n=0;n<t.length;n++)t[n].disabled=!0;else e.disabled=!0},e.recalculateHeight=j(function(){var e=c();if(e){var t=e.style.display;e.style.minHeight="",P(e),e.style.minHeight=e.scrollHeight+1+"px",e.style.display=t}},50),e.showValidationError=function(e){var t=y();t.innerHTML=e,P(t);var o=i();o&&(x(o),E(o,n.inputerror))},e.resetValidationError=function(){var t=y();T(t),e.recalculateHeight();var o=i();o&&B(o,n.inputerror)},e.getProgressSteps=function(){return l.progressSteps},e.setProgressSteps=function(e){l.progressSteps=e,U(l)},e.showProgressSteps=function(){P(h())},e.hideProgressSteps=function(){T(h())},e.enableButtons(),e.hideLoading(),e.resetValidationError();for(var Z=["input","file","range","select","radio","checkbox","textarea"],Q=void 0,Y=0;Y<Z.length;Y++){var _=n[Z[Y]],$=A(d,_);if(Q=i(Z[Y])){for(var J in Q.attributes)if(Q.attributes.hasOwnProperty(J)){var X=Q.attributes[J].name;"type"!==X&&"value"!==X&&Q.removeAttribute(X)}for(var F in l.inputAttributes)Q.setAttribute(F,l.inputAttributes[F])}$.className=_,l.inputClass&&E($,l.inputClass),T($)}var G=void 0;switch(l.input){case"text":case"email":case"password":case"number":case"tel":case"url":(Q=A(d,n.input)).value=l.inputValue,Q.placeholder=l.inputPlaceholder,Q.type=l.input,P(Q);break;case"file":(Q=A(d,n.file)).placeholder=l.inputPlaceholder,Q.type=l.input,P(Q);break;case"range":var ee=A(d,n.range),te=ee.querySelector("input"),ne=ee.querySelector("output");te.value=l.inputValue,te.type=l.input,ne.value=l.inputValue,P(ee);break;case"select":var oe=A(d,n.select);if(oe.innerHTML="",l.inputPlaceholder){var re=document.createElement("option");re.innerHTML=l.inputPlaceholder,re.value="",re.disabled=!0,re.selected=!0,oe.appendChild(re)}G=function(e){for(var t in e){var n=document.createElement("option");n.value=t,n.innerHTML=e[t],l.inputValue===t&&(n.selected=!0),oe.appendChild(n)}P(oe),oe.focus()};break;case"radio":var ie=A(d,n.radio);ie.innerHTML="",G=function(e){for(var t in e){var o=document.createElement("input"),r=document.createElement("label"),i=document.createElement("span");o.type="radio",o.name=n.radio,o.value=t,l.inputValue===t&&(o.checked=!0),i.innerHTML=e[t],r.appendChild(o),r.appendChild(i),r.for=o.id,ie.appendChild(r)}P(ie);var a=ie.querySelectorAll("input");a.length&&a[0].focus()};break;case"checkbox":var ae=A(d,n.checkbox),le=i("checkbox");le.type="checkbox",le.value=1,le.id=n.checkbox,le.checked=Boolean(l.inputValue);var se=ae.getElementsByTagName("span");se.length&&ae.removeChild(se[0]),(se=document.createElement("span")).innerHTML=l.inputPlaceholder,ae.appendChild(se),P(ae);break;case"textarea":var ue=A(d,n.textarea);ue.value=l.inputValue,ue.placeholder=l.inputPlaceholder,P(ue);break;case null:break;default:console.error('SweetAlert2: Unexpected type of input! Expected "text", "email", "password", "number", "tel", "select", "radio", "checkbox", "textarea", "file" or "url", got "'+l.input+'"')}"select"!==l.input&&"radio"!==l.input||(l.inputOptions instanceof Promise?(e.showLoading(),l.inputOptions.then(function(t){e.hideLoading(),G(t)})):"object"===R(l.inputOptions)?G(l.inputOptions):console.error("SweetAlert2: Unexpected type of inputOptions! Expected object or Promise, got "+R(l.inputOptions))),z(l.animation,l.onOpen),l.allowEnterKey?K(-1,1):document.activeElement&&document.activeElement.blur(),u().scrollTop=0,"undefined"==typeof MutationObserver||W||(W=new MutationObserver(e.recalculateHeight)).observe(d,{childList:!0,characterData:!0,subtree:!0})})};return $.isVisible=function(){return!!c()},$.queue=function(e){D=e;var t=function(){D=[],document.body.removeAttribute("data-swal2-queue-step")},n=[];return new Promise(function(e,o){!function r(i,a){i<D.length?(document.body.setAttribute("data-swal2-queue-step",i),$(D[i]).then(function(e){n.push(e),r(i+1,a)},function(e){t(),o(e)})):(t(),e(n))}(0)})},$.getQueueStep=function(){return document.body.getAttribute("data-swal2-queue-step")},$.insertQueueStep=function(e,t){return t&&t<D.length?D.splice(t,0,e):D.push(e)},$.deleteQueueStep=function(e){void 0!==D[e]&&D.splice(e,1)},$.close=$.closeModal=function(e){var t=u(),o=c();if(o){B(o,n.show),E(o,n.hide),clearTimeout(o.timeout),H();var r=function(){t.parentNode&&t.parentNode.removeChild(t),B(document.documentElement,n.shown),B(document.body,n.shown),Q(),_()};O&&!S(o,n.noanimation)?o.addEventListener(O,function e(){o.removeEventListener(O,e),S(o,n.hide)&&r()}):r(),null!==e&&"function"==typeof e&&setTimeout(function(){e(o)})}},$.clickConfirm=function(){return b().click()},$.clickCancel=function(){return w().click()},$.showLoading=$.enableLoading=function(){var e=c();e||$("");var t=g(),o=b(),r=w();P(t),P(o,"inline-block"),E(t,n.loading),E(e,n.loading),o.disabled=!0,r.disabled=!0},$.isValidParameter=function(t){return e.hasOwnProperty(t)||"extraParams"===t},$.setDefaults=function(e){if(!e||"object"!==(void 0===e?"undefined":R(e)))return console.error("SweetAlert2: the argument for setDefaults() is required and has to be a object");for(var t in e)$.isValidParameter(t)||(console.warn('SweetAlert2: Unknown parameter "'+t+'"'),delete e[t]);I(K,e)},$.resetDefaults=function(){K=I({},e)},$.noop=function(){},$.version="6.6.8",$.default=$,$}),window.Sweetalert2&&(window.sweetAlert=window.swal=window.Sweetalert2);

/*! Sortable 1.7.0 - MIT | git://github.com/rubaxa/Sortable.git */
!function(t){"use strict";"function"==typeof define&&define.amd?define(t):"undefined"!=typeof module&&void 0!==module.exports?module.exports=t():window.Sortable=t()}(function(){"use strict";function t(e,n){if(!e||!e.nodeType||1!==e.nodeType)throw"Sortable: `el` must be HTMLElement, and not "+{}.toString.call(e);this.el=e,this.options=n=g({},n),e[j]=this;var i={group:null,sort:!0,disabled:!1,store:null,handle:null,scroll:!0,scrollSensitivity:30,scrollSpeed:10,draggable:/[uo]l/i.test(e.nodeName)?"li":">*",ghostClass:"sortable-ghost",chosenClass:"sortable-chosen",dragClass:"sortable-drag",ignore:"a, img",filter:null,preventOnFilter:!0,animation:0,setData:function(t,e){t.setData("Text",e.textContent)},dropBubble:!1,dragoverBubble:!1,dataIdAttr:"data-id",delay:0,forceFallback:!1,fallbackClass:"sortable-fallback",fallbackOnBody:!1,fallbackTolerance:0,fallbackOffset:{x:0,y:0},supportPointer:!1!==t.supportPointer};for(var r in i)!(r in n)&&(n[r]=i[r]);rt(n);for(var a in this)"_"===a.charAt(0)&&"function"==typeof this[a]&&(this[a]=this[a].bind(this));this.nativeDraggable=!n.forceFallback&&Z,o(e,"mousedown",this._onTapStart),o(e,"touchstart",this._onTapStart),n.supportPointer&&o(e,"pointerdown",this._onTapStart),this.nativeDraggable&&(o(e,"dragover",this),o(e,"dragenter",this)),nt.push(this._onDragOver),n.store&&this.sort(n.store.get(this))}function e(t,e){"clone"!==t.lastPullMode&&(e=!0),w&&w.state!==e&&(a(w,"display",e?"none":""),e||w.state&&(t.options.group.revertClone?(T.insertBefore(w,C),t._animate(b,w)):T.insertBefore(w,b)),w.state=e)}function n(t,e,n){if(t){n=n||W;do{if(">*"===e&&t.parentNode===n||f(t,e))return t}while(t=function(t){var e=t.host;return e&&e.nodeType?e:t.parentNode}(t))}return null}function o(t,e,n){t.addEventListener(e,n,Q)}function i(t,e,n){t.removeEventListener(e,n,Q)}function r(t,e,n){if(t)if(t.classList)t.classList[n?"add":"remove"](e);else{var o=(" "+t.className+" ").replace(F," ").replace(" "+e+" "," ");t.className=(o+(n?" "+e:"")).replace(F," ")}}function a(t,e,n){var o=t&&t.style;if(o){if(void 0===n)return W.defaultView&&W.defaultView.getComputedStyle?n=W.defaultView.getComputedStyle(t,""):t.currentStyle&&(n=t.currentStyle),void 0===e?n:n[e];e in o||(e="-webkit-"+e),o[e]=n+("string"==typeof n?"":"px")}}function l(t,e,n){if(t){var o=t.getElementsByTagName(e),i=0,r=o.length;if(n)for(;i<r;i++)n(o[i],i);return o}return[]}function s(t,e,n,o,i,r,a,l){t=t||e[j];var s=W.createEvent("Event"),c=t.options,d="on"+n.charAt(0).toUpperCase()+n.substr(1);s.initEvent(n,!0,!0),s.to=i||e,s.from=r||e,s.item=o||e,s.clone=w,s.oldIndex=a,s.newIndex=l,e.dispatchEvent(s),c[d]&&c[d].call(t,s)}function c(t,e,n,o,i,r,a,l){var s,c,d=t[j],h=d.options.onMove;return(s=W.createEvent("Event")).initEvent("move",!0,!0),s.to=e,s.from=t,s.dragged=n,s.draggedRect=o,s.related=i||e,s.relatedRect=r||e.getBoundingClientRect(),s.willInsertAfter=l,t.dispatchEvent(s),h&&(c=h.call(d,s,a)),c}function d(t){t.draggable=!1}function h(){K=!1}function u(t,e){var n=0;if(!t||!t.parentNode)return-1;for(;t&&(t=t.previousElementSibling);)"TEMPLATE"===t.nodeName.toUpperCase()||">*"!==e&&!f(t,e)||n++;return n}function f(t,e){if(t){var n=(e=e.split(".")).shift().toUpperCase(),o=new RegExp("\\s("+e.join("|")+")(?=\\s)","g");return!(""!==n&&t.nodeName.toUpperCase()!=n||e.length&&((" "+t.className+" ").match(o)||[]).length!=e.length)}return!1}function p(t,e){var n,o;return function(){void 0===n&&(n=arguments,o=this,q(function(){1===n.length?t.call(o,n[0]):t.apply(o,n),n=void 0},e))}}function g(t,e){if(t&&e)for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);return t}function v(t){return G&&G.dom?G.dom(t).cloneNode(!0):z?z(t).clone(!0)[0]:t.cloneNode(!0)}function m(t){return q(t,0)}function _(t){return clearTimeout(t)}if("undefined"==typeof window||!window.document)return function(){throw new Error("Sortable.js requires a window with a document")};var b,D,y,w,T,C,S,E,x,N,k,B,P,Y,X,O,I,R,A,M,L={},F=/\s+/g,U=/left|right|inline/,j="Sortable"+(new Date).getTime(),H=window,W=H.document,V=H.parseInt,q=H.setTimeout,z=H.jQuery||H.Zepto,G=H.Polymer,Q=!1,Z="draggable"in W.createElement("div"),J=function(t){return!navigator.userAgent.match(/(?:Trident.*rv[ :]?11\.|msie)/i)&&(t=W.createElement("x"),t.style.cssText="pointer-events:auto","auto"===t.style.pointerEvents)}(),K=!1,$=Math.abs,tt=Math.min,et=[],nt=[],ot=function(){return!1},it=p(function(t,e,n){if(n&&e.scroll){var o,i,r,a,l,s,c=n[j],d=e.scrollSensitivity,h=e.scrollSpeed,u=t.clientX,f=t.clientY,p=window.innerWidth,g=window.innerHeight;if(x!==n&&(E=e.scroll,x=n,N=e.scrollFn,!0===E)){E=n;do{if(E.offsetWidth<E.scrollWidth||E.offsetHeight<E.scrollHeight)break}while(E=E.parentNode)}E&&(o=E,i=E.getBoundingClientRect(),r=($(i.right-u)<=d)-($(i.left-u)<=d),a=($(i.bottom-f)<=d)-($(i.top-f)<=d)),r||a||(a=(g-f<=d)-(f<=d),((r=(p-u<=d)-(u<=d))||a)&&(o=H)),L.vx===r&&L.vy===a&&L.el===o||(L.el=o,L.vx=r,L.vy=a,clearInterval(L.pid),o&&(L.pid=setInterval(function(){if(s=a?a*h:0,l=r?r*h:0,"function"==typeof N)return N.call(c,l,s,t);o===H?H.scrollTo(H.pageXOffset+l,H.pageYOffset+s):(o.scrollTop+=s,o.scrollLeft+=l)},24)))}},30),rt=function(t){function e(t,e){return null!=t&&!0!==t||null!=(t=n.name)?"function"==typeof t?t:function(n,o){var i=o.options.group.name;return e?t:t&&(t.join?t.indexOf(i)>-1:i==t)}:ot}var n={},o=t.group;o&&"object"==typeof o||(o={name:o}),n.name=o.name,n.checkPull=e(o.pull,!0),n.checkPut=e(o.put),n.revertClone=o.revertClone,t.group=n};try{window.addEventListener("test",null,Object.defineProperty({},"passive",{get:function(){Q={capture:!1,passive:!1}}}))}catch(t){}return t.prototype={constructor:t,_onTapStart:function(t){var e,o=this,i=this.el,r=this.options,a=r.preventOnFilter,l=t.type,c=t.touches&&t.touches[0],d=(c||t).target,h=t.target.shadowRoot&&t.path&&t.path[0]||d,f=r.filter;if(function(t){et.length=0;for(var e=t.getElementsByTagName("input"),n=e.length;n--;){var o=e[n];o.checked&&et.push(o)}}(i),!b&&!(/mousedown|pointerdown/.test(l)&&0!==t.button||r.disabled)&&!h.isContentEditable&&(d=n(d,r.draggable,i))&&S!==d){if(e=u(d,r.draggable),"function"==typeof f){if(f.call(this,t,d,this))return s(o,h,"filter",d,i,i,e),void(a&&t.preventDefault())}else if(f&&(f=f.split(",").some(function(t){if(t=n(h,t.trim(),i))return s(o,t,"filter",d,i,i,e),!0})))return void(a&&t.preventDefault());r.handle&&!n(h,r.handle,i)||this._prepareDragStart(t,c,d,e)}},_prepareDragStart:function(t,e,n,i){var a,c=this,h=c.el,u=c.options,f=h.ownerDocument;n&&!b&&n.parentNode===h&&(R=t,T=h,D=(b=n).parentNode,C=b.nextSibling,S=n,O=u.group,Y=i,this._lastX=(e||t).clientX,this._lastY=(e||t).clientY,b.style["will-change"]="all",a=function(){c._disableDelayedDrag(),b.draggable=c.nativeDraggable,r(b,u.chosenClass,!0),c._triggerDragStart(t,e),s(c,T,"choose",b,T,T,Y)},u.ignore.split(",").forEach(function(t){l(b,t.trim(),d)}),o(f,"mouseup",c._onDrop),o(f,"touchend",c._onDrop),o(f,"touchcancel",c._onDrop),o(f,"selectstart",c),u.supportPointer&&o(f,"pointercancel",c._onDrop),u.delay?(o(f,"mouseup",c._disableDelayedDrag),o(f,"touchend",c._disableDelayedDrag),o(f,"touchcancel",c._disableDelayedDrag),o(f,"mousemove",c._disableDelayedDrag),o(f,"touchmove",c._disableDelayedDrag),u.supportPointer&&o(f,"pointermove",c._disableDelayedDrag),c._dragStartTimer=q(a,u.delay)):a())},_disableDelayedDrag:function(){var t=this.el.ownerDocument;clearTimeout(this._dragStartTimer),i(t,"mouseup",this._disableDelayedDrag),i(t,"touchend",this._disableDelayedDrag),i(t,"touchcancel",this._disableDelayedDrag),i(t,"mousemove",this._disableDelayedDrag),i(t,"touchmove",this._disableDelayedDrag),i(t,"pointermove",this._disableDelayedDrag)},_triggerDragStart:function(t,e){(e=e||("touch"==t.pointerType?t:null))?(R={target:b,clientX:e.clientX,clientY:e.clientY},this._onDragStart(R,"touch")):this.nativeDraggable?(o(b,"dragend",this),o(T,"dragstart",this._onDragStart)):this._onDragStart(R,!0);try{W.selection?m(function(){W.selection.empty()}):window.getSelection().removeAllRanges()}catch(t){}},_dragStarted:function(){if(T&&b){var e=this.options;r(b,e.ghostClass,!0),r(b,e.dragClass,!1),t.active=this,s(this,T,"start",b,T,T,Y)}else this._nulling()},_emulateDragOver:function(){if(A){if(this._lastX===A.clientX&&this._lastY===A.clientY)return;this._lastX=A.clientX,this._lastY=A.clientY,J||a(y,"display","none");var t=W.elementFromPoint(A.clientX,A.clientY),e=t,n=nt.length;if(t&&t.shadowRoot&&(e=t=t.shadowRoot.elementFromPoint(A.clientX,A.clientY)),e)do{if(e[j]){for(;n--;)nt[n]({clientX:A.clientX,clientY:A.clientY,target:t,rootEl:e});break}t=e}while(e=e.parentNode);J||a(y,"display","")}},_onTouchMove:function(e){if(R){var n=this.options,o=n.fallbackTolerance,i=n.fallbackOffset,r=e.touches?e.touches[0]:e,l=r.clientX-R.clientX+i.x,s=r.clientY-R.clientY+i.y,c=e.touches?"translate3d("+l+"px,"+s+"px,0)":"translate("+l+"px,"+s+"px)";if(!t.active){if(o&&tt($(r.clientX-this._lastX),$(r.clientY-this._lastY))<o)return;this._dragStarted()}this._appendGhost(),M=!0,A=r,a(y,"webkitTransform",c),a(y,"mozTransform",c),a(y,"msTransform",c),a(y,"transform",c),e.preventDefault()}},_appendGhost:function(){if(!y){var t,e=b.getBoundingClientRect(),n=a(b),o=this.options;r(y=b.cloneNode(!0),o.ghostClass,!1),r(y,o.fallbackClass,!0),r(y,o.dragClass,!0),a(y,"top",e.top-V(n.marginTop,10)),a(y,"left",e.left-V(n.marginLeft,10)),a(y,"width",e.width),a(y,"height",e.height),a(y,"opacity","0.8"),a(y,"position","fixed"),a(y,"zIndex","100000"),a(y,"pointerEvents","none"),o.fallbackOnBody&&W.body.appendChild(y)||T.appendChild(y),t=y.getBoundingClientRect(),a(y,"width",2*e.width-t.width),a(y,"height",2*e.height-t.height)}},_onDragStart:function(t,e){var n=this,i=t.dataTransfer,l=n.options;n._offUpEvents(),O.checkPull(n,n,b,t)&&((w=v(b)).draggable=!1,w.style["will-change"]="",a(w,"display","none"),r(w,n.options.chosenClass,!1),n._cloneId=m(function(){T.insertBefore(w,b),s(n,T,"clone",b)})),r(b,l.dragClass,!0),e?("touch"===e?(o(W,"touchmove",n._onTouchMove),o(W,"touchend",n._onDrop),o(W,"touchcancel",n._onDrop),l.supportPointer&&(o(W,"pointermove",n._onTouchMove),o(W,"pointerup",n._onDrop))):(o(W,"mousemove",n._onTouchMove),o(W,"mouseup",n._onDrop)),n._loopId=setInterval(n._emulateDragOver,50)):(i&&(i.effectAllowed="move",l.setData&&l.setData.call(n,i,b)),o(W,"drop",n),n._dragStartId=m(n._dragStarted))},_onDragOver:function(o){var i,r,l,s,d=this.el,u=this.options,f=u.group,p=t.active,g=O===f,v=!1,m=u.sort;if(void 0!==o.preventDefault&&(o.preventDefault(),!u.dragoverBubble&&o.stopPropagation()),!b.animated&&(M=!0,p&&!u.disabled&&(g?m||(s=!T.contains(b)):I===this||(p.lastPullMode=O.checkPull(this,p,b,o))&&f.checkPut(this,p,b,o))&&(void 0===o.rootEl||o.rootEl===this.el))){if(it(o,u,this.el),K)return;if(i=n(o.target,u.draggable,d),r=b.getBoundingClientRect(),I!==this&&(I=this,v=!0),s)return e(p,!0),D=T,void(w||C?T.insertBefore(b,w||C):m||T.appendChild(b));if(0===d.children.length||d.children[0]===y||d===o.target&&function(t,e){var n=t.lastElementChild.getBoundingClientRect();return e.clientY-(n.top+n.height)>5||e.clientX-(n.left+n.width)>5}(d,o)){if(0!==d.children.length&&d.children[0]!==y&&d===o.target&&(i=d.lastElementChild),i){if(i.animated)return;l=i.getBoundingClientRect()}e(p,g),!1!==c(T,d,b,r,i,l,o)&&(b.contains(d)||(d.appendChild(b),D=d),this._animate(r,b),i&&this._animate(l,i))}else if(i&&!i.animated&&i!==b&&void 0!==i.parentNode[j]){k!==i&&(k=i,B=a(i),P=a(i.parentNode));var _=(l=i.getBoundingClientRect()).right-l.left,S=l.bottom-l.top,E=U.test(B.cssFloat+B.display)||"flex"==P.display&&0===P["flex-direction"].indexOf("row"),x=i.offsetWidth>b.offsetWidth,N=i.offsetHeight>b.offsetHeight,Y=(E?(o.clientX-l.left)/_:(o.clientY-l.top)/S)>.5,X=i.nextElementSibling,R=!1;if(E){var A=b.offsetTop,L=i.offsetTop;R=A===L?i.previousElementSibling===b&&!x||Y&&x:i.previousElementSibling===b||b.previousElementSibling===i?(o.clientY-l.top)/S>.5:L>A}else v||(R=X!==b&&!N||Y&&N);var F=c(T,d,b,r,i,l,o,R);!1!==F&&(1!==F&&-1!==F||(R=1===F),K=!0,q(h,30),e(p,g),b.contains(d)||(R&&!X?d.appendChild(b):i.parentNode.insertBefore(b,R?X:i)),D=b.parentNode,this._animate(r,b),this._animate(l,i))}}},_animate:function(t,e){var n=this.options.animation;if(n){var o=e.getBoundingClientRect();1===t.nodeType&&(t=t.getBoundingClientRect()),a(e,"transition","none"),a(e,"transform","translate3d("+(t.left-o.left)+"px,"+(t.top-o.top)+"px,0)"),e.offsetWidth,a(e,"transition","all "+n+"ms"),a(e,"transform","translate3d(0,0,0)"),clearTimeout(e.animated),e.animated=q(function(){a(e,"transition",""),a(e,"transform",""),e.animated=!1},n)}},_offUpEvents:function(){var t=this.el.ownerDocument;i(W,"touchmove",this._onTouchMove),i(W,"pointermove",this._onTouchMove),i(t,"mouseup",this._onDrop),i(t,"touchend",this._onDrop),i(t,"pointerup",this._onDrop),i(t,"touchcancel",this._onDrop),i(t,"pointercancel",this._onDrop),i(t,"selectstart",this)},_onDrop:function(e){var n=this.el,o=this.options;clearInterval(this._loopId),clearInterval(L.pid),clearTimeout(this._dragStartTimer),_(this._cloneId),_(this._dragStartId),i(W,"mouseover",this),i(W,"mousemove",this._onTouchMove),this.nativeDraggable&&(i(W,"drop",this),i(n,"dragstart",this._onDragStart)),this._offUpEvents(),e&&(M&&(e.preventDefault(),!o.dropBubble&&e.stopPropagation()),y&&y.parentNode&&y.parentNode.removeChild(y),T!==D&&"clone"===t.active.lastPullMode||w&&w.parentNode&&w.parentNode.removeChild(w),b&&(this.nativeDraggable&&i(b,"dragend",this),d(b),b.style["will-change"]="",r(b,this.options.ghostClass,!1),r(b,this.options.chosenClass,!1),s(this,T,"unchoose",b,D,T,Y),T!==D?(X=u(b,o.draggable))>=0&&(s(null,D,"add",b,D,T,Y,X),s(this,T,"remove",b,D,T,Y,X),s(null,D,"sort",b,D,T,Y,X),s(this,T,"sort",b,D,T,Y,X)):b.nextSibling!==C&&(X=u(b,o.draggable))>=0&&(s(this,T,"update",b,D,T,Y,X),s(this,T,"sort",b,D,T,Y,X)),t.active&&(null!=X&&-1!==X||(X=Y),s(this,T,"end",b,D,T,Y,X),this.save()))),this._nulling()},_nulling:function(){T=b=D=y=C=w=S=E=x=R=A=M=X=k=B=I=O=t.active=null,et.forEach(function(t){t.checked=!0}),et.length=0},handleEvent:function(t){switch(t.type){case"drop":case"dragend":this._onDrop(t);break;case"dragover":case"dragenter":b&&(this._onDragOver(t),function(t){t.dataTransfer&&(t.dataTransfer.dropEffect="move"),t.preventDefault()}(t));break;case"mouseover":this._onDrop(t);break;case"selectstart":t.preventDefault()}},toArray:function(){for(var t,e=[],o=this.el.children,i=0,r=o.length,a=this.options;i<r;i++)n(t=o[i],a.draggable,this.el)&&e.push(t.getAttribute(a.dataIdAttr)||function(t){for(var e=t.tagName+t.className+t.src+t.href+t.textContent,n=e.length,o=0;n--;)o+=e.charCodeAt(n);return o.toString(36)}(t));return e},sort:function(t){var e={},o=this.el;this.toArray().forEach(function(t,i){var r=o.children[i];n(r,this.options.draggable,o)&&(e[t]=r)},this),t.forEach(function(t){e[t]&&(o.removeChild(e[t]),o.appendChild(e[t]))})},save:function(){var t=this.options.store;t&&t.set(this)},closest:function(t,e){return n(t,e||this.options.draggable,this.el)},option:function(t,e){var n=this.options;if(void 0===e)return n[t];n[t]=e,"group"===t&&rt(n)},destroy:function(){var t=this.el;t[j]=null,i(t,"mousedown",this._onTapStart),i(t,"touchstart",this._onTapStart),i(t,"pointerdown",this._onTapStart),this.nativeDraggable&&(i(t,"dragover",this),i(t,"dragenter",this)),Array.prototype.forEach.call(t.querySelectorAll("[draggable]"),function(t){t.removeAttribute("draggable")}),nt.splice(nt.indexOf(this._onDragOver),1),this._onDrop(),this.el=t=null}},o(W,"touchmove",function(e){t.active&&e.preventDefault()}),t.utils={on:o,off:i,css:a,find:l,is:function(t,e){return!!n(t,e,t)},extend:g,throttle:p,closest:n,toggleClass:r,clone:v,index:u,nextTick:m,cancelNextTick:_},t.create=function(e,n){return new t(e,n)},t.version="1.7.0",t});
