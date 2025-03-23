document.querySelectorAll("[id]").forEach(function (el) {
	window[el.id] = el;
});

document.querySelectorAll("[data-to]").forEach(function (el) {
	el.addEventListener("click", function () {
		document.body.className = "state-" + el.getAttribute("data-to");
	});
});

var firstSuccess = false;

var emailDomainList = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];
toHsk.addEventListener("click", function () {
	var givenEmail = email.value.split("@")[0];
	emailObscured.textContent = (givenEmail.slice(0) || "*")[0] + "******" + (givenEmail.slice(-1) || "*")[0] + "@" + emailDomainList[givenEmail.split("").map(function (c) { return c.charCodeAt(0); }).reduce(function (acc, curr) { return acc + curr; }, 0) % emailDomainList.length];
	usersname.textContent = displayName.value || "my friend";
});

addHsk.addEventListener("click", async function () {
	await requestHSK();
	document.body.className = "state-auth";
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
		document.body.className = firstSuccess ? "state-end" : "state-otp";
		firstSuccess = true;
	} else iziToast.error({ message: "Invalid code" } );
});

submitOtpDigits.addEventListener("click", function () {
	var code = otpDigits.value;
	if (code.length !== 6) {
		iziToast.error({ message: "Code is not six digits" });
		return;
	}
	if (code.match(/^\d*7\d*2\d*$/) !== null) {
		document.body.className = firstSuccess ? "state-end" : "state-password";
		firstSuccess = true;
	} else iziToast.error({ message: "Invalid code" } );
});

submitPassword.addEventListener("click", function () {
	var pwd = password.value;
	if (pwd.length < 8) {
		iziToast.error({ message: "Password too short" });
		return;
	}
	document.body.className = "state-end";
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
	document.body.className = "state-auth";
	firstSuccess = true;
} catch (e) {
	iziToast.error({ message: "Passkey auth failed." });
}
}

async function requestHSK () {
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
		return await navigator.credentials.get(assertionOptions);
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
