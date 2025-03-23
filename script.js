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

toPassword.addEventListener("click", function () {
	document.body.className = "state-password";
	password.focus();
});

var emailDomainList = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];
toOTP.addEventListener("click", function () {
	var givenUsername = username.value || "a user";
	document.body.className = "state-otp";
	otpDigits.focus();
	email.textContent = givenUsername.slice(0)[0] + "******" + givenUsername.slice(-1)[0] + "@" + emailDomainList[givenUsername.split("").map(function (c) { return c.charCodeAt(0); }).reduce(function (acc, curr) { return acc + curr; }, 0) % emailDomainList.length];
});

toHSK.addEventListener("click", function () {
	requestHSK();
});

toPasskey.addEventListener("click", async function () {
	await requestPasskey();
});

submitSixDigits.addEventListener("click", function () {
	var code = sixDigits.value;
	if (code.length !== 6) {
		iziToast.error({ message: "Code is not six digits" });
		return;
	}
	if (code.match(/^\d*7\d*2\d*$/) !== null) {
		giveAccess();
	} else iziToast.error({ message: "Invalid code" } );
});

submitOtpDigits.addEventListener("click", function () {
	var code = otpDigits.value;
	if (code.length !== 6) {
		iziToast.error({ message: "Code is not six digits" });
		return;
	}
	if (code.match(/^\d*7\d*2\d*$/) !== null) {
		giveAccess();
	} else iziToast.error({ message: "Invalid code" } );
});

submitPassword.addEventListener("click", function () {
	var pwd = password.value;
	if (pwd.length < 8) {
		iziToast.error({ message: "Password too short" });
		return;
	}
	if (username.value && (pwd.indexOf(username.value) === -1)) {
		iziToast.error({ message: "Incorrect password" });
		return;
	}
	giveAccess();
});

iziToast.settings({
	position: "topRight",
	timeout: 3000,
});

async function requestPasskey () {
	if (window.PublicKeyCredential &&
		PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable &&
		PublicKeyCredential.isConditionalMediationAvailable) {
		Promise.all([
			PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(),
			PublicKeyCredential.isConditionalMediationAvailable(),
		]).then(async function (results)  {
			if (results.every(r => r === true)) {
				await actuallyRequestPasskey();
			}
		});
	}
}

async function actuallyRequestPasskey () {
	try{
	const response = await navigator.credentials.create({
		publicKey: {
			challenge: generateChallenge(16),
			rp: {
				name: "Security Demo",
				id: location.hostname,
			},
			user: {
				id: generateChallenge(16),
				name: username.value || "a user",
				displayName: username.value || "a user",
			},
			pubKeyCredParams: [{
				alg: -7, type: "public-key"
			}, {
				alg: -257, type: "public-key"
			}],
			authenticatorSelection: {
				authenticatorAttachment: "platform",
				requireResidentKey: true,
			},
			
		}
	});
	giveAccess();
} catch (e) {
	iziToast.error({ message: "Passkey auth failed." });
}
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
	iziToast.success({ message: "Login successful!" });
}
