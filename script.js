document.querySelectorAll("[id]").forEach(function (el) {
	window[el.id] = el;
});

document.querySelectorAll("[data-to]").forEach(function (el) {
	el.addEventListener("click", function () {
		document.body.className = "state-" + el.getAttribute("data-to");
	});
});

toAuth.addEventListener("click", function () {
	document.body.className = "state-auth";
	sixDigits.focus();
});

toHSK.addEventListener("click", function () {
	requestHSK();
});

submitSixDigits.addEventListener("click", function () {
	var code = sixDigits.value;
	if (code.length !== 6) return;
	if (code.match(/^\d*7\d*2\d*$/) !== null) {
		giveAccess();
	}
});

function requestPasskey () {
	if (window.PublicKeyCredential &&
		PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable &&
		PublicKeyCredential.isConditionalMediationAvailable) {
		Promise.all([
			PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(),
			PublicKeyCredential.isConditionalMediationAvailable(),
		]).then(results => {
			if (results.every(r => r === true)) {
				actuallyRequestPasskey();
			}
		});
	}
}

function actuallyRequestPasskey () {
	// Example `PublicKeyCredentialCreationOptions` contents
	navigator.credentials.create({
		challenge: generateChallenge(16),
		rp: {
			name: "Security Demo",
			id: "localhost",
		},
		user: {
			id: "*****",
			name: "john78",
			displayName: "John",
		},
		pubKeyCredParams: [{
			alg: -7, type: "public-key"
		},{
			alg: -257, type: "public-key"
		}],
		excludeCredentials: [{
			id: "*****",
			type: 'public-key',
			transports: ['internal'],
		}],
		authenticatorSelection: {
			authenticatorAttachment: "platform",
			requireResidentKey: true,
		}
	});
}

function requestHSK () {
	if (window.PublicKeyCredential) {
		let challenge = new Uint8Array(new Array(16).map(function () {
			return Math.floor(Math.random() * 256);
		}));
		const assertionOptions = {
			"publicKey": {
				"challenge": challenge,
				"allowCredentials": [{
					"id": generateChallenge(16),
					"type": "public-key",
					"transports": ["usb", "nfc"],
				}],
			},
		};
		navigator.credentials.get(assertionOptions);
	} else {
		toHSK.disabled = true;
	}
}

function generateChallenge (l) {
	return new Uint8Array(new Array(l || 16).map(function () {
		return Math.floor(Math.random() * 256);
	}));
}

function giveAccess () {
	alert("YOU SUCCESSFULLY LOGGED IN!");
}
