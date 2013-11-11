window.FrontMonitor = (function() {
	var FrontMonitorVersion = "{FRONT_MONITOR_VERSION}";
	/////////////////CHECK IF OPTIONS RERQIRED SET
	if (!window.FrontMonitorOptions || !FrontMonitorOptions.application || !FrontMonitorOptions.baseServiceUrl) 
		return;
	
	// ///////////////TRIM
	if (typeof String.prototype.trim !== 'function') {
		String.prototype.trim = function() {
			return this.replace(/^\s+|\s+$/g, '');
		}
	}

	/////////////////////READY

	(function() {

		var onDomReadyIdentifier = 'onDomReady';
		var isBound = false;
		var readyList = [];

		if (window[onDomReadyIdentifier] && typeof window[onDomReadyIdentifier] == 'function') {
			return;
		}

		// pone los callbacks
		var whenReady = function() {
			// Make sure body exists, at least, in case IE gets a little
			// overzealous.
			// This is taked directly from jQuery's implementation.
			if (!document.body) {
				return setTimeout(whenReady, 13);
			}

			for ( var i = 0; i < readyList.length; i++) {
				readyList[i]();
			}
			readyList = [];
		};

		var bindReady = function() {
			// Mozilla, Opera and webkit nightlies currently support this event
			if (document.addEventListener) {
				var DOMContentLoaded = function() {
					document.removeEventListener("DOMContentLoaded",
							DOMContentLoaded, false);
					whenReady();
				};

				document.addEventListener("DOMContentLoaded", DOMContentLoaded,
						false);
				window.addEventListener("load", whenReady, false); // fallback

				// If IE event model is used
			} else if (document.attachEvent) {

				var onreadystatechange = function() {
					if (document.readyState === "complete"
							|| document.readyStateChange == 'interactive') {
						document.detachEvent("onreadystatechange",
								onreadystatechange);
						whenReady();
					}
				};

				document.attachEvent("onreadystatechange", onreadystatechange);
				window.attachEvent("onload", whenReady); // fallback

				// If IE and not a frame, continually check to see if the
				// document is ready
				var toplevel = false;

				try {
					toplevel = (window.frameElement);
				} catch (e) {
				}

				// The DOM ready check for Internet Explorer
				if (document.documentElement.doScroll && toplevel) {
					var doScrollCheck = function() {

						// stop searching if we have no functions to call
						// (or, in other words, if they have already been
						// called)
						if (readyList.length === 0) {
							return;
						}

						try {
							// If IE is used, use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							document.documentElement.doScroll("left");
						} catch (e) {
							setTimeout(doScrollCheck, 1);
							return;
						}

						// and execute any waiting functions
						whenReady();
					};

					doScrollCheck();
				}
			}
		};

		window.onDomReadyIdentifierLogger = function(callback) {
			// Push the given callback onto the list of functions to execute
			// when ready.
			// If the dom has alredy loaded, call 'whenReady' right away.
			// Otherwise bind the ready-event if it hasn't been done already
			readyList.push(callback);
			if (document.readyState == "complete") {
				whenReady();
			} else if (!isBound) {
				bindReady();
				isBound = true;
			}
		};
	})();

	// ///////////////////////INIT LOGGER
	// We start basic capturing right away
	var defaults = window.FrontMonitorOptions || {};
	if (defaults.custom_parameter && typeof defaults.custom_parameter === "object" && defaults.custom_parameter.length) {
		defaults.custom_parameter = defaults.custom_parameter.join(" | ");
	}
	var Config = {
		initialTime : defaults.initialTime || new Date().getTime(),
		serviceUrl : defaults.baseServiceUrl + "/problem/create",
		logErrorsToConsole : defaults.logConsole || true,
		application : defaults.application,
		uow : defaults.uow || null,
		custom_parameter : defaults.custom_parameter || null,
		ready : false,
		version : FrontMonitorVersion
	};
	var trackedErrors = [];
	setWindowOnError();

	// get options from data-params
		var overrideData = defaults.override;
		if (overrideData) {
			overrideData = overrideData.split(",");
			for ( var i in override)
				overrideData[i] = overrideData[i].trim();
		}
		Config.overrideFunctions = overrideData;

		
//		console.log(Config);
		
	// on document ready
	window.onDomReadyIdentifierLogger(function() {
		Config.ready = true;
		setWindowOnError();
		// override manual entered functions
		for ( var i in Config.overrideFunctions) {
			override(Config.overrideFunctions[i]);
		}

		
		if (window.jQuery) {
			// override jquery.fn.on
			Config.jQuery_fn_on_original = Config.jQuery_fn_on_original || jQuery.fn.on;
			jQuery.fn.on = function() {
				var args = Array.prototype.slice.call(arguments), fnArgIdx = 4;
	
				// Search index of function argument
				while ((--fnArgIdx > -1) && (typeof args[fnArgIdx] !== 'function'))
					;
	
				// If the function is not found, then subscribe original event
				// handler function
				if (fnArgIdx === -1) {
					return Config.jQuery_fn_on_original.apply(this, arguments);
				}
	
				// If the function is found, then subscribe wrapped event handler
				// function
				args[fnArgIdx] = (function(fnOriginHandler) {
					return function() {
						var argums = Array.prototype.slice.call(arguments);
	//					origArgums = arguments;
	//					console.log(arguments.callee);
						try {
							fnOriginHandler.apply(this, arguments);
						} catch (e) {
	//						ee = args;
	//						console.log(origArgums[0]);
	//						console.log(fnOriginHandler);
	//						fnorig = fnOriginHandler;
	//						err = qwe;
							captureException(argums, e);
						}
					};
				})(args[fnArgIdx]);
	
				// Call original jQuery.fn.on, with the same list of arguments, but
				// a function replaced with a proxy.
				return Config.jQuery_fn_on_original.apply(this, args);
			};
		}
		//si ya hay errores que los trackee
		trackAndResetErrors();
	});

	// oiverride functions
	function override(func) {
		var original = window[func];
		window[func] = function() {
			try {
				var args = Array.prototype.slice.call(arguments);
				original(args);
			} catch (e) {
				captureException(null, e);
			}
		}
	}

	/**
	 * Setea window on error
	 */
	function setWindowOnError() {
		window.onerror = function(e) {
			captureException(arguments, e, true);
		};
	}
	
	
	// capture and handle different kinds of exceptions
	function captureException(args, error, basicTracking) {
		var thisError;
		if (basicTracking) {
			var message = args[0]
			thisError = {
				message : args[0],
				file : args[1],
				line : args[2],
				timestamp : new Date().getTime() - Config.initialTime
			};
		} else {
			if (Config.logErrorsToConsole && window.console && console.error) {
				 console.error(error);
			}
			if (args) {
				var obj = args[0].target;
				var target = obj.tagName;
				var className = obj.className;
				if (className)
					target += '.' + className;
				if (obj.id)
					target += '#' + obj.id;
				var selector = args[0].handleObj.selector;
				var type = args[0].type;
			}
			if (typeof error === "string") {
				error = {
					message : error
				};
			}
			
			thisError = {
				name : error.name || null,
				message : error.message || "Unknown error.",
				stack : error.stack || null,
				event_type : type || null,
				event_target : target || null,
				event_selector : selector || null,
				timestamp : new Date().getTime() - Config.initialTime
			};
		}
		if (Config.pageview) {
			thisError.pageview = Config.pageview;
			thisError.application = Config.application;
		}
		else {
			thisError.baseUrl = window.location.href;
			thisError.application = Config.application;
			thisError.cookies = document.cookie;
			if (!Config.uow && window.X_UOW) {
				thisError.uow = Config.uow = window.X_UOW;
			}
			if (Config.custom_parameter) {
				thisError.custom_parameter = Config.custom_parameter;
			}
		}
		thisError.version = Config.version;
		trackedErrors.push(thisError);
		trackAndResetErrors();
	}

	// track by ajax
	function trackAndResetErrors() {
		while (trackedErrors.length && Config.ready) {
			var thisError = trackedErrors.shift();
			//si no hay pageview loguea el primer error y espera al peagview que venga para seguir con el proximo.
			if (!Config.pageview) {
				Config.ready = false;
			} else if (!thisError.pageview)  {
				thisError.pageview = Config.pageview;
			}
			trackError(thisError);
		}
	}
	
	function trackError(err) {
		var params = '';
		for (var k in err) {
			params += k + '=' + encodeURIComponent(err[k]) + '&';
		}
		var url = Config.serviceUrl + '?' + params.substring(0, params.length -1);
		
		try {
			if (!window.XDomainRequest) {
				var xhr = new XMLHttpRequest();
				xhr.open("GET", url, true);
				xhr.onreadystatechange = function() {
					if (xhr.readyState == 4) {
						handleResponse(xhr.responseText);
					}
				};
				xhr.send(null);
			}
			else {
				
				var xdr = new XDomainRequest();
				xdr.open("GET", url);
				xdr.onload = function() {
					handleResponse(xdr.responseText);
				};
				xdr.send();
			}
		} catch (e) {
		}
	}

	function handleResponse(data) {
		if (!Config.pageview) {
			try {
				var responseJson = eval("(" + data + ")");
				if (responseJson.pageview) {
					Config.pageview = responseJson.pageview;
				}
			} catch(e) {}
		}
		if (!Config.ready) {
			Config.ready = true;
			trackAndResetErrors();
		}
	}
	
	/**
	 * Setea los custom params, en general abtestings
	 */
	function setCustomParameter(param) {
			if (typeof param === "string") {
				Config.custom_parameter = param; 
			}
			else {
				Config.custom_parameter = param.join(" | ");
			}
	}
	
	/**
	 * Loguea un error custom autogenerado
	 */
	function logXHRError(options) {
		
	
		var _options = {
		   "name" : "AJAX Error",
		   "message" : "",
		   "stack" : "",
		   "xhr" : {},
		   "textStatus" : ""
		};
		
		extend(_options, options);
		

		try {
			
			var errorRetrieved = eval("(" + _options.xhr.responseText + ")");
			_options.message = _options.message + " Problem: " +errorRetrieved.error;
		
		}
		catch (e){
			
			_options.message = _options.message + " Problem: " + _options.textStatus;
		}

		logError(_options);
	}
	
	/**
	 * Loguea un error custom autogenerado
	 */
	function logError(message, stack) {
		if (typeof message === "string") {		
			captureException(null, {
								name: "Custom Error",
								message: message,
								stack: stack
								});
		} else {
			var _options = {
		   			"name" : "Custom Error",
				   "message" : "",
				   "stack" : ""
					};
			extend(_options, message);
			captureException(null, _options);
		}
	}
	
	/**
	 * Expone la configuracion del modulo
	 * @returns
	 */
	function getConfig() {
		return Config;
	}
	
	/**
	 * Extiende un objeto, mimic de $.extend
	 */
	function extend(){
	    for(var i=1; i<arguments.length; i++)
	        for(var key in arguments[i])
	            if(arguments[i].hasOwnProperty(key))
	                arguments[0][key] = arguments[i][key];
	    return arguments[0];
	}
	
	return {
		captureException : captureException,
		setCustomParameter : setCustomParameter,
		logError : logError,
		getConfig : getConfig,
		logXHRError : logXHRError
	};

})();